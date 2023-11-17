const tests = [
  { name: "Up to 25m CPT", cost: 800 },
  { name: "Up to 5x CPTs", cost: 2900 },
  { name: "Seismic CPTs (Vs only)*", cost: 1500 },
  { name: "Seismic DMTs", cost: 3000 },
  { name: "Post-processing", cost: { oneTest: 1200, additionalTests: 700 } },
  { name: "On-site Geophysicist Monitoring", cost: 140 },
  { name: "25m DMT", cost: 1800 },
  { name: "Processing", cost: 260 },
  { name: "10m DPSH", cost: 350 },
  { name: "Travel", cost: 150 },
  { name: "Accommodation", cost: 300 },
  { name: "Per Diem", cost: 140 },
  { name: "Underground Service Location", cost: "450" },
];

const clientForm = document.getElementById("clientForm");
const addTestButton = document.getElementById("addTest");
const quotationTable = document.getElementById("quotationTable");
const totalCostElement = document.getElementById("totalCost");
const reviewQuoteButton = document.getElementById("reviewQuote");
const reviewModal = document.getElementById("reviewModal");
const modalContent = document.getElementById("modalContent");
const clearButton = document.getElementById("clearButton");
const emailQuoteButton = document.getElementById("emailQuote");
const closeModalButton = document.getElementById("closeModal");

addTestButton.addEventListener("click", function () {
  const selectedTest = document.getElementById("testSelect").value;
  const quantity = parseInt(document.getElementById("quantity").value);
  const test = tests.find((t) => t.name === selectedTest);

  if (!test || isNaN(quantity) || quantity <= 0) {
    alert("Please select a valid test and quantity.");
    return;
  }

  const row = quotationTable.insertRow(-1);
  const nameCell = row.insertCell(0);
  const costCell = row.insertCell(1);
  const quantityCell = row.insertCell(2);
  const totalCostCell = row.insertCell(3);

  nameCell.innerText = selectedTest;
  costCell.innerText = `Unit Cost: $${test.cost}`;
  quantityCell.innerText = quantity;
  totalCostCell.innerText = `$${calculateTestCost(test, quantity)}`;

  totalCostElement.innerText = `$${calculateTotalCost()}`;

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.addEventListener("click", function () {
    row.remove();
    totalCostElement.innerText = `$${calculateTotalCost()}`;
  });

  const deleteCell = row.insertCell(4);
  deleteCell.appendChild(deleteButton);

  document.getElementById("testSelect").value = "";
  document.getElementById("quantity").value = 0;
});

function calculateTestCost(test, quantity) {
  if (test.cost && typeof test.cost === "object") {
    if (quantity === 1) {
      return test.cost.oneTest;
    } else if (quantity > 1) {
      return (
        test.cost.additionalTests + test.cost.additionalTests * (quantity - 1)
      );
    }
  } else if (!isNaN(test.cost)) {
    return test.cost * quantity;
  } else if (test.cost.includes("-")) {
    const range = test.cost.split("-");
    const minCost = parseInt(range[0]);
    const maxCost = parseInt(range[1]);
    return `${minCost}-${maxCost}`;
  }

  return 0;
}

function calculateTotalCost() {
  let totalCost = 0;
  const rows = quotationTable.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    const totalCostCell = cells[3];
    const costText = totalCostCell.innerText;

    if (costText.includes("-")) {
      const [minCost, maxCost] = costText
        .split("-")
        .map((cost) => parseInt(cost));
      totalCost += (minCost + maxCost) / 2;
    } else {
      totalCost += parseInt(costText.replace("$", ""));
    }
  }

  return totalCost;
}

clearButton.addEventListener("click", function () {
  quotationTable.innerHTML =
    "<tr><th>Test/Service</th><th>Unit Cost ($) - Excl. GST</th><th>Quantity</th><th>Total Cost</th></tr>";
  totalCostElement.innerText = "0";
});

emailQuoteButton.addEventListener("click", function () {
  const clientName = document.getElementById("clientName").value;
  const clientEmail = document.getElementById("clientEmail").value;
  const clientAddress = document.getElementById("clientAddress").value;
  const subject = "Quote Request";

  let body = `Dear ${clientName},\n\nThank you for considering our services. Below is the quote for your requested tests:\n\n`;

  const rows = quotationTable.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    const testName = cells[0].innerText;
    const totalCost = cells[3].innerText;

    body += `${testName}: Total Cost: ${totalCost}\n`;
  }

  body += `\nTotal Cost: $${totalCostElement.innerText}\n\nTest Location Address:\n${clientAddress}\n\nThank you,\nExplore Geotechnical Team`;

  const mailtoLink = `mailto:${clientEmail}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoLink;
});

// Attach an event listener to the "Review Quotation" button
reviewQuoteButton.addEventListener("click", function () {
  const rows = quotationTable.getElementsByTagName("tr");

  // Clear previous content
  modalContent.innerHTML = "";

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    const testName = cells[0].innerText;
    const totalCost = cells[3].innerText;

    // Create a paragraph element for each test
    const testParagraph = document.createElement("p");
    testParagraph.textContent = `${testName}: Total Cost: ${totalCost}`;
    modalContent.appendChild(testParagraph);
  }

  // Add total cost to the modal
  const totalCostParagraph = document.createElement("p");
  totalCostParagraph.textContent = `Total Cost: $${totalCostElement.innerText}`;
  modalContent.appendChild(totalCostParagraph);

  // Adjust the position of the modal
  const modalTopPosition = window.scrollY + 50; // Adjust the value as needed
  reviewModal.style.top = `${modalTopPosition}px`;

  // Display the modal
  reviewModal.style.display = "block";
});

// Attach an event listener to the "Close" button in the modal
closeModalButton.addEventListener("click", function () {
  // Update the display property to "none" to hide the modal
  reviewModal.style.display = "none";
});

// Add event listener to close the modal when clicking anywhere outside the modal
document.addEventListener("mousedown", function (event) {
  if (!reviewModal.contains(event.target)) {
    reviewModal.style.display = "none";
  }
});

// Add event listener to prevent click events from reaching the window when clicking inside the modal
reviewModal.addEventListener("mousedown", function (event) {
  // Prevent the click event from reaching the document
  event.stopPropagation();
});
