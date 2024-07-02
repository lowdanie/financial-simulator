<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import NumberInput from './NumberInput.svelte';

	import type { ExpenseParameters } from '$lib/model/expense';
	import { dateToInputMonthString, inputMonthStringToDate } from '$lib/model/date_utils';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	export let expense: ExpenseParameters;

	let updatedExpense: ExpenseParameters = { ...expense };
	let updatedDateStrings = {
		start: dateToInputMonthString(expense.start),
		end: dateToInputMonthString(expense.end)
	};
	let editing = false;

	function onSave() {
		expense = {
			...updatedExpense,
			start: inputMonthStringToDate(updatedDateStrings.start),
			end: inputMonthStringToDate(updatedDateStrings.end)
		};
		dispatch('update', expense);
		editing = false;
	}

	function onCancel() {
		editing = false;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{editing ? updatedExpense.name : expense.name}</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if editing}
			<form on:submit|preventDefault={onSave} class="grid w-full items-center gap-4">
				<div class="flex items-center gap-2">
					<Label for="expense-name-{expense.id}">Name</Label>
					<Input bind:value={updatedExpense.name} type="text" id="expense-name-{expense.id}" />
				</div>
				<div class="flex items-center gap-2">
					<Label for="expense-start-{expense.id}">Start</Label>
					<Input
						bind:value={updatedDateStrings.start}
						type="month"
						id="expense-start-{expense.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="expense-end-{expense.id}">End</Label>
					<Input bind:value={updatedDateStrings.end} type="month" id="expense-end-{expense.id}" />
				</div>
				<div class="flex items-center gap-2">
					<Label for="expense-initial-{expense.id}">Monthly Expense</Label>
					<NumberInput
						bind:value={updatedExpense.initialMonthlyExpense}
						id="expense-initial-{expense.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="expense-increase-{expense.id}">Real Increase Rate</Label>
					<NumberInput
						bind:value={updatedExpense.realIncreaseRate}
						id="expense-increase-{expense.id}"
					/>
				</div>
				<div class="flex justify-between">
					<Button type="submit">Save</Button>
					<Button variant="outline" on:click={onCancel}>Cancel</Button>
				</div>
			</form>
		{:else}
			<div class="grid w-full items-center gap-2">
				<div class="flex gap-2">
					<span class="text-sm font-medium">Name</span>
					<span class="text-sm">{expense.name}</span>
				</div>
				<div class="flex gap-2">
					<span class="text-sm font-medium">Start</span>
					<span class="text-sm">{dateToInputMonthString(expense.start)}</span>
				</div>
				<div class="flex gap-2">
					<span class="text-sm font-medium">End</span>
					<span class="text-sm">{dateToInputMonthString(expense.end)}</span>
				</div>
				<div class="flex gap-2">
					<span class="text-sm font-medium">Monthly Expense</span>
					<span class="text-sm">{expense.initialMonthlyExpense}</span>
				</div>
				<div class="flex gap-2">
					<span class="text-sm font-medium">Real Increase Rate</span>
					<span class="text-sm">{expense.realIncreaseRate}</span>
				</div>
				<div class="flex justify-between">
					<Button variant="secondary" on:click={() => (editing = true)}>Edit</Button>
					<Button variant="destructive" on:click={() => dispatch('remove', expense)}>Delete</Button>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
