// lib/singpass/myinfo.ts
import { MyInfoPersonResponse, ProcessedMyInfoData } from './types'
import { hashNRIC } from './crypto'

/**
 * Fetch MyInfo person data from API
 * @param accessToken - OAuth access token from Singpass
 * @param uinfin - User's NRIC/FIN (from ID token sub claim)
 * @returns MyInfo person response
 */
export async function fetchMyInfoData(
  accessToken: string,
  uinfin: string
): Promise<MyInfoPersonResponse> {
  const myInfoUrl = process.env.SINGPASS_USERINFO_URL

  if (!myInfoUrl) {
    throw new Error('SINGPASS_USERINFO_URL not configured')
  }

  const response = await fetch(`${myInfoUrl}/${uinfin}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`MyInfo API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Process MyInfo response into storage-ready format
 * @param myInfo - Raw MyInfo person response
 * @returns Processed data with NRIC hashed
 */
export async function processMyInfoData(
  myInfo: MyInfoPersonResponse
): Promise<ProcessedMyInfoData> {
  // CRITICAL: Hash NRIC immediately
  const nricHash = await hashNRIC(myInfo.uinfin.value)

  // Format address from structured data
  const homeAddress = formatMyInfoAddress(myInfo.regadd)

  return {
    name: myInfo.name.value,
    nricHash,
    nationality: myInfo.nationality.desc,
    dateOfBirth: myInfo.dob.value,
    homeAddress,
  }
}

/**
 * Format MyInfo address structure into readable string
 * @param regadd - MyInfo registered address object
 * @returns Formatted address string
 */
function formatMyInfoAddress(regadd: MyInfoPersonResponse['regadd']): string {
  if (regadd.type === 'Unformatted') {
    return regadd.country?.value || 'Address not available'
  }

  const parts: string[] = []

  if (regadd.block?.value) parts.push(`Blk ${regadd.block.value}`)
  if (regadd.street?.value) parts.push(regadd.street.value)
  if (regadd.unit?.value) parts.push(`#${regadd.unit.value}`)
  if (regadd.building?.value) parts.push(regadd.building.value)
  if (regadd.postal?.value) parts.push(`Singapore ${regadd.postal.value}`)

  return parts.join(', ')
}
