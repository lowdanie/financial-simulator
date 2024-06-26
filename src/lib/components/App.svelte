<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	import People from './People.svelte';
	import Jobs from './Jobs.svelte';
	import Expenses from './Expenses.svelte';
	import RetirementAccounts401k from './RetirementAccounts401k.svelte';
	import SavingsAccount from './SavingsAccount.svelte';
	import GeneralParameters from './GeneralParameters.svelte';

	import type { JobParameters } from '$lib/model/job';
	import type { Person as PersonType } from '$lib/model/person';
	import type { ExpenseParameters } from '$lib/model/expense';
	import type { RetirementAccount401kParameters } from '$lib/model/retirement_account_401k';
	import type { SavingsAccountParameters } from '$lib/model/savings_account';
	import type { GeneralParameters as GeneralType } from '$lib/model/model';

	let people: PersonType[] = [];
	let jobs: JobParameters[] = [];
	let expenses: ExpenseParameters[] = [];
	let retirement_accounts_401k: RetirementAccount401kParameters[] = [];
	let savings_account: SavingsAccountParameters = {
		name: 'Savings Account',
		initialValue: 0,
		annualPercentageYield: 4
	};
	let generalParams: GeneralType = {
		startYear: 2024,
		durationYears: 50,
		inflationRate: 3
	};
	let paramNames = ['General', 'People', 'Jobs', 'Expenses', 'Savings Account', '401k Accounts'];
	let activeParamsIdx = 0;
</script>

<div class="flex flex-col p-10">
	<div class="space-y-0.5">
		<h2 class="text-2xl font-bold tracking-tight">Financial Simulator</h2>
		<p class="text-muted-foreground">Simulate personal finances</p>
	</div>

	<Separator class="my-6" />

	<div class="flex gap-10">
		<div class="flex w-40 flex-col items-stretch gap-2">
			{#each paramNames as paramName, i}
				<Button class="justify-start" variant="ghost" on:click={() => (activeParamsIdx = i)}
					>{paramName}</Button
				>
			{/each}
		</div>

		<div class="w-80">
			{#if paramNames[activeParamsIdx] == 'General'}
				<GeneralParameters bind:params={generalParams} />
			{:else if paramNames[activeParamsIdx] == 'People'}
				<People bind:people />
			{:else if paramNames[activeParamsIdx] == 'Jobs'}
				<Jobs bind:jobs {people} />
			{:else if paramNames[activeParamsIdx] == 'Expenses'}
				<Expenses bind:expenses />
			{:else if paramNames[activeParamsIdx] == 'Savings Account'}
				<SavingsAccount bind:account={savings_account} />
			{:else if paramNames[activeParamsIdx] == '401k Accounts'}
				<RetirementAccounts401k bind:accounts={retirement_accounts_401k} {people} />
			{/if}
		</div>
	</div>
</div>
