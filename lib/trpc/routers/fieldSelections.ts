/**
 * Field Selection Constants for Supabase Queries
 *
 * These constants define exactly which fields to fetch from Supabase tables
 * to prevent overfetching (SELECT *). Each constant is optimized for a specific
 * use case (list view, detail view, card view, etc.).
 *
 * Usage:
 * ```typescript
 * const { data } = await supabase
 *   .from('properties')
 *   .select(PROPERTY_LIST_FIELDS)
 * ```
 */

// ============================================================================
// PROPERTY FIELD SELECTIONS
// ============================================================================

/**
 * Fields for property list/search views
 * Optimized for: Search results, browse pages
 */
export const PROPERTY_LIST_FIELDS = [
  'id',
  'address',
  'price',
  'bedrooms',
  'bathrooms',
  'property_type',
  'district',
  'listing_quality_score',
  'featured',
  'listing_source',
  'verification_level',
  'images(url,is_primary)',
].join(',');

/**
 * Fields for property card components
 * Optimized for: Property cards in grids/lists
 */
export const PROPERTY_CARD_FIELDS = [
  'id',
  'address',
  'price',
  'psf',
  'bedrooms',
  'bathrooms',
  'property_type',
  'district',
  'listing_quality_score',
  'featured',
  'listing_source',
  'listing_type',
  'images!inner(url,is_primary)',
].join(',');

/**
 * Fields for property detail pages
 * Optimized for: Full property detail view
 */
export const PROPERTY_DETAIL_FIELDS = [
  'id',
  'address',
  'price',
  'psf',
  'bedrooms',
  'bathrooms',
  'property_type',
  'district',
  'postal_code',
  'description',
  'floor_area_sqft',
  'built_up_area_sqft',
  'land_area_sqft',
  'tenure',
  'furnishing',
  'floor_level',
  'total_units',
  'year_built',
  'nearby_mrt',
  'nearby_schools',
  'features',
  'ai_highlights',
  'ai_generated_description',
  'listing_quality_score',
  'featured',
  'listing_source',
  'listing_type',
  'verification_level',
  'owner_singpass_verified',
  'legal_doc_urls',
  'floorplan_url',
  'tour_url',
  'images(*)',
].join(',');

/**
 * Fields for comparable transactions
 * Optimized for: Transaction history, comparables
 */
export const PROPERTY_TRANSACTION_FIELDS = [
  'id',
  'address',
  'price',
  'psf',
  'bedrooms',
  'bathrooms',
  'property_type',
  'district',
  'floor_area_sqft',
  'transaction_date',
  'sold_at',
].join(',');

// ============================================================================
// USER FIELD SELECTIONS
// ============================================================================

/**
 * Fields for user profile pages
 * Optimized for: Full user profile view
 */
export const USER_PROFILE_FIELDS = [
  'id',
  'email',
  'name',
  'phone',
  'date_of_birth',
  'nationality',
  'nric_hash',
  'home_address',
  'mailing_address',
  'singpass_verified',
  'singpass_verified_at',
  'created_at',
  'updated_at',
].join(',');

/**
 * Fields for user list/search views
 * Optimized for: User listings, admin panels
 */
export const USER_LIST_FIELDS = [
  'id',
  'email',
  'name',
  'phone',
  'singpass_verified',
  'created_at',
].join(',');

/**
 * Fields for basic user info (e.g., property owner display)
 * Optimized for: Minimal user display
 */
export const USER_BASIC_FIELDS = [
  'id',
  'name',
  'email',
  'phone',
  'singpass_verified',
].join(',');

// ============================================================================
// AGENT FIELD SELECTIONS
// ============================================================================

/**
 * Fields for agent list/search views
 * Optimized for: Agent directory, search results
 */
export const AGENT_LIST_FIELDS = [
  'id',
  'name',
  'agency_name',
  'cea_number',
  'specialization',
  'languages',
  'rating',
  'total_deals',
  'phone',
  'email',
].join(',');

/**
 * Fields for agent profile pages
 * Optimized for: Full agent profile view
 */
export const AGENT_PROFILE_FIELDS = [
  'id',
  'name',
  'agency_name',
  'cea_number',
  'specialization',
  'languages',
  'rating',
  'total_deals',
  'bio',
  'years_experience',
  'active_listings',
  'phone',
  'email',
  'whatsapp',
  'telegram',
  'profile_picture_url',
  'cea_verified_at',
  'created_at',
].join(',');

// ============================================================================
// SERVICE PROVIDER FIELD SELECTIONS
// ============================================================================

/**
 * Fields for service provider list/directory
 * Optimized for: Service provider directory, search results
 */
export const SERVICE_PROVIDER_LIST_FIELDS = [
  'id',
  'name',
  'category',
  'rating',
  'review_count',
  'phone',
  'email',
  'description',
  'services_offered',
  'created_at',
].join(',');

/**
 * Fields for service provider detail pages
 * Optimized for: Full service provider profile
 */
export const SERVICE_PROVIDER_DETAIL_FIELDS = [
  'id',
  'name',
  'category',
  'rating',
  'review_count',
  'phone',
  'email',
  'whatsapp',
  'description',
  'services_offered',
  'operating_hours',
  'service_areas',
  'certifications',
  'created_at',
  'updated_at',
].join(',');

// ============================================================================
// LEARNING MODULE FIELD SELECTIONS
// ============================================================================

/**
 * Fields for learning module list views
 * Optimized for: Course catalog, learning dashboard
 */
export const LEARNING_MODULE_LIST_FIELDS = [
  'id',
  'title',
  'description',
  'difficulty',
  'estimated_duration_minutes',
  'category',
  'order_index',
  'created_at',
].join(',');

/**
 * Fields for learning module detail/content pages
 * Optimized for: Full module view with content
 */
export const LEARNING_MODULE_DETAIL_FIELDS = [
  'id',
  'title',
  'description',
  'content',
  'difficulty',
  'estimated_duration_minutes',
  'category',
  'quiz_questions',
  'order_index',
  'created_at',
  'updated_at',
].join(',');

/**
 * Fields for user learning progress
 * Optimized for: Progress tracking, completion status
 */
export const LEARNING_PROGRESS_FIELDS = [
  'id',
  'user_id',
  'module_id',
  'completed',
  'score',
  'attempted_at',
  'modules(title,difficulty)',
].join(',');

// ============================================================================
// FINANCIAL TRANSACTION FIELD SELECTIONS
// ============================================================================

/**
 * Fields for transaction history lists
 * Optimized for: Transaction history tables
 */
export const TRANSACTION_HISTORY_FIELDS = [
  'id',
  'user_id',
  'property_id',
  'transaction_type',
  'amount',
  'transaction_date',
  'status',
  'recorded_at',
].join(',');

/**
 * Fields for detailed transaction view
 * Optimized for: Transaction detail pages
 */
export const TRANSACTION_DETAIL_FIELDS = [
  'id',
  'user_id',
  'property_id',
  'transaction_type',
  'amount',
  'stamp_duty',
  'legal_fees',
  'agent_commission',
  'other_fees',
  'transaction_date',
  'status',
  'notes',
  'recorded_at',
  'properties(address,property_type,district)',
].join(',');
