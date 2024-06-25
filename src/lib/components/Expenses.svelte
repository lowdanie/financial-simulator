<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Expense from './Expense.svelte';
	import type { ExpenseParameters } from '$lib/model/expense';

	export let expenses: ExpenseParameters[];

	let nextId = expenses.length;

	const defaultExpense: ExpenseParameters = {
		id: 0,
		name: '',
		start: new Date(1990, 0, 1),
		end: new Date(1990, 0, 2),
		initialMonthlyExpense: 1000,
		realIncreaseRate: 0
	};

	function addExpense() {
		expenses = [...expenses, { ...defaultExpense, id: nextId, name: `Expense ${nextId}` }];
		nextId += 1;
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
	<h2 class="text-2xl">Expenses</h2>

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
