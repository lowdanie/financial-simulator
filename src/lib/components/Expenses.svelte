<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	import Expense from './Expense.svelte';
	import { type ExpenseParameters, generateExpenseId } from '$lib/model/expense';

	export let expenses: ExpenseParameters[];

	const defaultExpense: ExpenseParameters = {
		id: 0,
		name: '',
		start: new Date(2025, 0, 1),
		end: new Date(2035, 0, 2),
		initialMonthlyExpense: 1000,
		realIncreaseRate: 0
	};

	function addExpense() {
		const expenseId = generateExpenseId();
		expenses = [...expenses, { ...defaultExpense, id: expenseId, name: `Expense (${expenseId})` }];
	}

	function removeExpense(expense: ExpenseParameters) {
		expenses = expenses.filter((x) => x.id != expense.id);
	}

	function updateExpense(expense: ExpenseParameters) {
		const i = expenses.findIndex((x) => x.id == expense.id);
		expenses[i] = expense;
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<div>
		<h2 class="text-2xl">Expenses</h2>
	</div>

	<Separator />

	<ul class="flex flex-col gap-4">
		{#each expenses as expense (expense.id)}
			<li>
				<Expense
					{expense}
					on:remove={(e) => removeExpense(e.detail)}
					on:update={(e) => updateExpense(e.detail)}
				/>
			</li>
		{/each}
	</ul>
	<div>
		<Button on:click={addExpense}>Add</Button>
	</div>
</div>
