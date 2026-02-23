'use client';

import { motion, type Variants } from 'framer-motion';

interface Pillar {
  icon: string;
  title: string;
  description: string;
  stat: string;
}

const PILLARS: Pillar[] = [
  {
    icon: '🛡️',
    title: 'Zero Scam Guarantee',
    description:
      'Every listing owner verified via Singpass MyInfo. No ghost listings, no agent impersonation — only real, authenticated properties.',
    stat: '0 Fraud Cases Reported',
  },
  {
    icon: '🤖',
    title: 'AI-First Intelligence',
    description:
      "5 specialized AI agents analyzing 200,000+ data points daily to give you the edge — whether you're buying, renting, or investing.",
    stat: '98% Prediction Accuracy',
  },
  {
    icon: '📊',
    title: 'Full Market Transparency',
    description:
      'Access to URA, HDB and CEA data integrated directly into every listing. Make decisions backed by official government data.',
    stat: '100% Data-Backed Insights',
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E293B] mb-3">
            Why Singapore Trusts Alzen Realty
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Built on transparency, powered by AI, and secured by Singpass.
          </p>
        </div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {PILLARS.map((pillar) => (
            <motion.div
              key={pillar.title}
              variants={cardVariants}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-5xl mb-5" aria-hidden="true">{pillar.icon}</div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-3">{pillar.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{pillar.description}</p>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-sm font-semibold">
                {pillar.stat}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
