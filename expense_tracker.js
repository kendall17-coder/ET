// Expense Tracker for Monthly Living Expenses
// Save this as expense_tracker.js and run with Node.js

const fs = require('fs');
const readline = require('readline');
const path = require('path');

class Expense {
  constructor(category, amount, date, note = "") {
    this.category = category;
    this.amount = amount;
    this.date = date; // Format: YYYY-MM-DD
    this.note = note;
  }

  static fromObject(obj) {
    return new Expense(obj.category, obj.amount, obj.date, obj.note || "");
  }
}

class ExpenseTracker {
  constructor() {
    this.expenses = [];
  }

  addExpense(category, amount, date = null, note = "") {
    if (!date) {
      date = new Date().toISOString().slice(0, 10);
    }
    this.expenses.push(new Expense(category, amount, date, note));
  }

  listExpenses(month = null) {
    if (!month) {
      return this.expenses;
    }
    return this.expenses.filter(exp => exp.date.slice(0, 7) === month);
  }

  monthlyTotal(month) {
    return this.expenses
      .filter(exp => exp.date.slice(0, 7) === month)
      .reduce((sum, exp) => sum + exp.amount, 0);
  }

  categoryTotal(month, category) {
    return this.expenses
      .filter(exp => exp.date.slice(0, 7) === month && exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
  }

  save(filename) {
    fs.writeFileSync(filename, JSON.stringify(this.expenses, null, 2));
  }

  load(filename) {
    if (fs.existsSync(filename)) {
      const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
      this.expenses = data.map(Expense.fromObject);
    } else {
      this.expenses = [];
    }
  }
}

// Collapsible test instructions are at the bottom!

// --- Command-line UI ---
const FILENAME = path.join(__dirname, 'expenses.json');
const tracker = new ExpenseTracker();
tracker.load(FILENAME);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer)));
}

async function main() {
  while (true) {
    console.log("\nExpense Tracker Menu");
    console.log("1. Add Expense");
    console.log("2. List Expenses");
    console.log("3. Show Monthly Total");
    console.log("4. Show Category Total");
    console.log("5. Save and Exit");
    const choice = (await prompt("Choose an option: ")).trim();

    if (choice === "1") {
      const category = await prompt("Enter category: ");
      const amount = parseFloat(await prompt("Enter amount: "));
      let date = await prompt("Enter date (YYYY-MM-DD, or leave blank for today): ");
      const note = await prompt("Optional note: ");
      date = date.trim() || null;
      tracker.addExpense(category, amount, date, note);
      console.log("Expense added.");
    } else if (choice === "2") {
      let month = await prompt("Enter month to view (YYYY-MM, or leave blank for all): ");
      month = month.trim() || null;
      const expenses = tracker.listExpenses(month);
      console.log(`\n${"Date".padEnd(12)}${"Category".padEnd(15)}${"Amount".padEnd(10)}Note`);
      console.log("-".repeat(50));
      for (const exp of expenses) {
        console.log(
          `${exp.date.padEnd(12)}${exp.category.padEnd(15)}$${exp.amount.toFixed(2).padEnd(10)}${exp.note}`
        );
      }
    } else if (choice === "3") {
      const month = (await prompt("Enter month (YYYY-MM): ")).trim();
      const total = tracker.monthlyTotal(month);
      console.log(`Total expenses for ${month}: $${total.toFixed(2)}`);
    } else if (choice === "4") {
      const month = (await prompt("Enter month (YYYY-MM): ")).trim();
      const category = (await prompt("Enter category: ")).trim();
      const total = tracker.categoryTotal(month, category);
      console.log(`Total for ${category} in ${month}: $${total.toFixed(2)}`);
    } else if (choice === "5") {
      tracker.save(FILENAME);
      console.log("Expenses saved. Goodbye!");
      break;
    } else {
      console.log("Invalid option. Try again.");
    }
  }
  rl.close();
}

if (require.main === module) {
  main();
}

/*
<details>
<summary>How to test the code</summary>

1. Run the program: `node expense_tracker.js`
2. Add several expenses with different categories and months.
    - Try using today's date and custom dates.
    - Try with and without a note.
3. List all expenses, and filter by a specific month.
4. Get the monthly total for a month you added expenses to.
5. Get the category total for a category in a specific month.
6. Save and exit. Re-run and ensure expenses are loaded.

</details>
*/