// app/(auth)/verify/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/nextauth.config'
import { SingpassButton } from '@/components/auth/SingpassButton'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

const faqs = [
  {
    question: 'Is my NRIC stored?',
    answer:
      'No. We only store a cryptographic hash of your NRIC (SHA-256). Your actual NRIC number is never saved in our database or logs. This hash allows us to verify your identity without storing sensitive data.',
  },
  {
    question: 'What data is shared?',
    answer:
      'Singpass shares: Full legal name, Nationality, Date of Birth, and Registered Residential Address. This data is used to verify your identity and pre-fill forms when you list properties. You can review the data sharing consent screen before approving.',
  },
  {
    question: 'Can I un-verify?',
    answer:
      'Singpass verification is permanent for security and trust reasons. Once your account is verified, it remains verified. However, you can delete your entire Space Realty account at any time from Settings → Account → Delete Account.',
  },
  {
    question: 'Why is verification required?',
    answer:
      'To list properties, view seller contact information, or make offers, we need to verify your identity to prevent fraud and ensure all parties are genuine. This protects both buyers and sellers on our platform.',
  },
  {
    question: 'Is Singpass verification secure?',
    answer:
      "Yes. Singpass is Singapore's National Digital Identity system, managed by GovTech. It uses bank-level security with biometric authentication. Space Realty never sees your Singpass password or biometric data.",
  },
]

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string }
}) {
  const session = await auth()

  // Already verified? Redirect to dashboard
  if (session?.user.singpassVerification?.verified) {
    redirect(searchParams.callbackUrl || '/dashboard')
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🛡️</div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Verify Your Identity with Singpass
          </h1>
          <p className="text-lg text-gray-600">
            Space Realty requires Singpass verification to ensure trust and authenticity for all
            users.
          </p>
        </div>

        {/* Benefits */}
        <Card className="mb-6 bg-emerald-50 border-emerald-200">
          <CardHeader>
            <CardTitle>Why Verify?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <p className="text-sm">Instant form filling with verified MyInfo data</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <p className="text-sm">Build trust with verified badge on your profile</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <p className="text-sm">Fraud prevention and secure transactions</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <p className="text-sm">Faster property listings and offer submissions</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex justify-center mb-12">
          <SingpassButton size="lg" callbackUrl={searchParams.callbackUrl} />
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
