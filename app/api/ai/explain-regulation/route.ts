import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Mock response chunks to simulate streaming AI
const MOCK_STREAM_PARTS = [
    "<p>Sure, let me explain ABSD like you're 5 years old!</p>",
    "<p>Imagine you have a toy box (your first home). The government says, 'Great! You have a toy box. That's fine.'</p>",
    "<ul><li>If you are a <strong>Singaporean citizen</strong>, everything is cool.</li>",
    "<li>If you are a <strong>Permanent Resident</strong>, you have to pay a little bit extra (5% tax) just to put your first toy box here.</li></ul>",
    "<p>But then, you decide you want a <strong>second toy box</strong>. The government wants to make sure everyone gets a chance to have at least one toy box. So, to discourage you from taking up too many, they say:</p>",
    "<ul><li>'Okay, you can have a second toy box, but you have to pay a big fee (20% for citizens, 30% for PRs) to the taxman!'</li></ul>",
    "<p>For <strong>foreigners</strong> coming from another country, they have to pay a huge fee (<strong>60% tax</strong>) right from their very first toy box!</p>",
    "<p><strong>What if I'm just replacing an old box?</strong><br/>If you're a married couple (and at least one is a citizen) buying a new house before selling the old one, you still have to pay the fee upfront. But! If you sell the old house within 6 months, you can ask for your fee back.</p>"
];

export async function POST(req: NextRequest) {
    try {
        const { content, moduleId } = await req.json();

        if (!content) {
            return new Response('Missing content', { status: 400 });
        }

        // Create a streaming response
        const stream = new ReadableStream({
            async start(controller) {
                // Send parts with a slight delay to simulate processing
                for (const part of MOCK_STREAM_PARTS) {
                    // Simulate latency
                    await new Promise((resolve) => setTimeout(resolve, 300));

                    const textData = new TextEncoder().encode(part);
                    controller.enqueue(textData);
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        return new Response('Error processing request', { status: 500 });
    }
}
