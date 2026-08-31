const testCases = [
    "Hi!",
    "Where should I go for a trip?",
    "I like adventure.",
    "What is the capital of France?",
    "Plan a 3-day itinerary for Delhi.",
    "Find me cheap flight tickets to New York.",
    "What's the weather like in Manali?",
    "Recommend some budget hotels in Goa.",
    "What should I pack for a beach vacation?",
    "Give me some street food recommendations in Mumbai.",
    "How early should I book train tickets?",
    "I want a relaxing trip.",
    "What is the currency of Japan?",
    "Is it safe to travel solo?",
    "Suggest a romantic getaway destination.",
    "How much does a trip to Bali cost?",
    "What are the top attractions in London?",
    "I need a packing list for a hiking trip.",
    "Can you book a hotel for me?",
    "Thanks for your help!"
];

async function runTests() {
    console.log("Running 20 Chatbot Test Cases...\n");
    let passed = 0;
    
    for (let i = 0; i < testCases.length; i++) {
        const query = testCases[i];
        process.stdout.write(`Test ${i + 1}/20 - Query: "${query}" ... `);
        
        try {
            const res = await fetch("http://localhost:8080/api/v1/chatbot/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: query })
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.reply && !data.reply.includes("missing or invalid")) {
                    console.log("✅ Passed");
                    passed++;
                } else {
                    console.log("❌ Failed (Mock/Error Response)");
                }
            } else {
                console.log(`❌ Failed (Status ${res.status})`);
            }
        } catch (e) {
            console.log("❌ Failed (Network Error)");
        }
    }
    
    console.log(`\nTest Run Complete! ${passed}/20 Passed.`);
}

runTests();
