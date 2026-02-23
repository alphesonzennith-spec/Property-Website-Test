import Link from 'next/link';
import { Clock, Users, BookOpen } from 'lucide-react';
import { mockLearningModules } from '@/lib/mock';
import { LearningCategory, DifficultyLevel } from '@/types/learning';

function getCategoryColor(category: LearningCategory): string {
  switch (category) {
    case LearningCategory.Buying:
      return 'bg-[#10B981]/10 text-[#10B981]';
    case LearningCategory.Selling:
      return 'bg-[#6366F1]/10 text-[#6366F1]';
    case LearningCategory.Renting:
      return 'bg-blue-100 text-blue-600';
    case LearningCategory.Financing:
      return 'bg-[#F59E0B]/10 text-[#d97706]';
    case LearningCategory.LegalTax:
      return 'bg-rose-100 text-rose-600';
    case LearningCategory.HomeImprovements:
      return 'bg-orange-100 text-orange-600';
    case LearningCategory.Insights:
      return 'bg-purple-100 text-purple-600';
    case LearningCategory.HomeJourney:
      return 'bg-cyan-100 text-cyan-600';
    case LearningCategory.DIY:
      return 'bg-lime-100 text-lime-600';
    case LearningCategory.FengShui:
      return 'bg-violet-100 text-violet-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function getDifficultyBadge(difficulty: DifficultyLevel): { label: string; className: string } {
  switch (difficulty) {
    case 'Beginner':
      return { label: 'Beginner', className: 'bg-green-100 text-green-700' };
    case 'Intermediate':
      return { label: 'Intermediate', className: 'bg-[#F59E0B]/10 text-[#d97706]' };
    case 'Advanced':
      return { label: 'Advanced', className: 'bg-red-100 text-red-600' };
    default:
      return { label: difficulty, className: 'bg-gray-100 text-gray-600' };
  }
}

function formatCategoryLabel(cat: LearningCategory): string {
  switch (cat) {
    case LearningCategory.LegalTax:
      return 'Legal & Tax';
    case LearningCategory.HomeImprovements:
      return 'Home Improvements';
    case LearningCategory.HomeJourney:
      return 'Home Journey';
    case LearningCategory.FengShui:
      return 'Feng Shui';
    default:
      return cat;
  }
}

export function LearningPreview() {
  const modules = mockLearningModules.slice(0, 3);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E293B] mb-2">
              Property Education Hub
            </h2>
            <p className="text-gray-500">
              Learn everything about Singapore property — from HDB basics to investment strategies.
            </p>
          </div>
          <Link
            href="/resources"
            className="hidden sm:inline-block text-sm font-semibold text-[#10B981] hover:text-emerald-700 transition-colors shrink-0 ml-4"
          >
            View all modules →
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((mod) => {
            const diffBadge = getDifficultyBadge(mod.difficulty);
            const catColor = getCategoryColor(mod.category);
            const isEli5 = mod.difficulty === 'Beginner';

            return (
              <Link
                href={`/resources/${mod.slug}`}
                key={mod.id}
                className="rounded-xl bg-white border border-gray-100 p-5 hover:shadow-md transition-shadow block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
              >
                {/* Category + badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${catColor}`}>
                    {formatCategoryLabel(mod.category)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${diffBadge.className}`}>
                    {diffBadge.label}
                  </span>
                  {isEli5 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
                      ELI5
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-[#1E293B] mb-2 leading-snug group-hover:text-[#10B981] transition-colors">
                  {mod.title}
                </h3>

                {/* Description — 2 lines */}
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
                  {mod.summary}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{mod.estimatedMinutes} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{mod.completionCount.toLocaleString()} completed</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#10B981] group-hover:gap-2.5 transition-all">
                  <BookOpen className="w-4 h-4" />
                  Start Learning
                  <span className="text-base">→</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/resources"
            className="inline-block text-sm font-semibold text-[#10B981] hover:text-emerald-700 transition-colors"
          >
            View all modules →
          </Link>
        </div>
      </div>
    </section>
  );
}
