let step = 0; // ✅ Start from step 0 to include company name
let userData = {};
const questions = [
    "Enter your Company Name:", // ✅ First question is company name
    "Enter Annual Revenue (in ₹):",
    "Enter Loan Amount Required (in ₹):",
    "Enter GST Compliance (%):",
    "Enter Past Defaults (0 for none, else number):",
    "Enter Bank Transactions (0 - Low, 1 - Medium, 2 - High):",
    "Enter Market Trend (0 - Declining, 1 - Stable, 2 - Growth):"
];

// ✅ Ask the first question when the page loads
window.onload = function () {
    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> ${questions[step]}</p>`;
};

// ✅ Trigger sendMessage() when "Enter" key is pressed
document.getElementById("user-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

async function sendMessage() {
    let input = document.getElementById("user-input").value.trim();
    let chatBox = document.getElementById("chat-box");

    if (input === "") return;

    // ✅ Display user message on the right
    let userMessage = `<p class="user-message"><strong>You:</strong> ${input}</p>`;
    chatBox.innerHTML += userMessage;
    document.getElementById("user-input").value = "";

    if (!validateInput(input, step)) {
        chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> Invalid input. ${questions[step]}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
        return;
    }

    storeUserData(input, step);
    step++;

    if (step < questions.length) {
        setTimeout(() => {
            chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> ${questions[step]}</p>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 1000);
    } else {
        await fetchCreditScore();
    }
}

function validateInput(input, step) {
    if (step === 0) return input.length > 0; // ✅ Company name must not be empty
    if (step === 1 || step === 2) return !isNaN(input) && input > 0;
    if (step === 3) return !isNaN(input) && input >= 0 && input <= 100;
    if (step === 4) return !isNaN(input) && input >= 0;
    if (step === 5 || step === 6) return [0, 1, 2].includes(parseInt(input));
    return true;
}

function storeUserData(input, step) {
    const keys = ["company_name", "annual_revenue", "loan_amount", "gst_compliance", "past_defaults", "bank_transactions", "market_trend"];
    userData[keys[step]] = isNaN(input) ? input : parseFloat(input);
}

async function fetchCreditScore() {
    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> Calculating your CIBIL score...</p>`;

    let testData = {
        "features": [
            userData.annual_revenue,
            userData.loan_amount,
            userData.gst_compliance,
            userData.past_defaults,
            userData.bank_transactions,
            userData.market_trend
        ]
    };

    try {
        let response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let result = await response.json();
        let score = Math.round(result.predicted_credit_score);

        chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> Predicted Credit Score: ${score}</p>`;
        updateDashboard(score);
    } catch (error) {
        console.error("Fetch error:", error);
        chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> Error fetching score. Check console for details.</p>`;
    }
}

function updateDashboard(score) {
    let scoreElement = document.getElementById("credit-score");
    let riskLevelElement = document.getElementById("risk-level");
    let chatBox = document.getElementById("chat-box");
    let dashboardContainer = document.querySelector(".dashboard-container");

    scoreElement.innerText = `Credit Score: ${score}`;
    dashboardContainer.classList.remove("high-risk-border");

    let riskReason = "";
    if (score >= 750) {
        riskLevelElement.innerText = "Risk Level: Low";
        riskLevelElement.className = "risk-level low-risk";
        riskReason = "Good financial stability and strong credit history.";
    } else if (score >= 500) {
        riskLevelElement.innerText = "Risk Level: Medium";
        riskLevelElement.className = "risk-level medium-risk";
        riskReason = "Some risks due to loan amount or inconsistent transactions.";
    } else {
        riskLevelElement.innerText = "Risk Level: High";
        riskLevelElement.className = "risk-level high-risk";
        riskReason = `High risk due to past defaults (${userData.past_defaults}) or high loan amount (${userData.loan_amount}₹).`;

        // ✅ Add red border if high risk
        dashboardContainer.classList.add("high-risk-border");
        chatBox.classList.add("high-risk-border");
    }

    chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> Reason: ${riskReason}</p>`;
}

// ✅ Reset Chatbot & Dashboard
function resetChat() {
    document.getElementById("chat-box").innerHTML = "";
    document.getElementById("credit-score").innerText = "Credit Score: --";
    document.getElementById("risk-level").innerText = "Risk Level: --";
    document.querySelector(".dashboard-container").classList.remove("high-risk-border");
    document.querySelector(".chat-box").classList.remove("high-risk-border");
    step = 0;
    userData = {};

    // ✅ Re-ask first question after reset
    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> ${questions[step]}</p>`;
}
