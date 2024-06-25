<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	import People from './People.svelte';
	import Jobs from './Jobs.svelte';
	import Expenses from './Expenses.svelte';
	import RetirementAccounts401k from './RetirementAccounts401k.svelte';

	import type { JobParameters } from '$lib/model/job';
	import type { Person as PersonType } from '$lib/model/person';
	import type { ExpenseParameters } from '$lib/model/expense';
	import type { RetirementAccount401kParameters } from '$lib/model/retirement_account_401k';

	let people: PersonType[] = [];
	let jobs: JobParameters[] = [];
	let expenses: ExpenseParameters[] = [];
	let retirement_accounts_401k: RetirementAccount401kParameters[] = [];

	let paramNames = ['People', 'Jobs', 'Expenses', '401k Accounts'];
	let activeParamsIdx = 0;
</script>

<div class="flex flex-col p-10">
	<div class="space-y-0.5">
		<h2 class="text-2xl font-bold tracking-tight">Financial Simulator</h2>
		<p class="text-muted-foreground">Simulate personal finances</p>
	</div>

	<Separator class="my-6" />

	<div class="flex gap-10">
		<div class="flex w-40 flex-col gap-2 items-stretch">
			{#each paramNames as paramName, i}
				<Button class="justify-start" variant="ghost" on:click={() => (activeParamsIdx = i)}>{paramName}</Button>
			{/each}
		</div>

		<div class="w-72">
			{#if activeParamsIdx == 0}
				<People bind:people />
			{/if}
		</div>
		<!-- <Separator class="my-4" />
	<Jobs bind:jobs {people} />
	<Separator class="my-4" />
	<Expenses bind:expenses />
	<Separator class="my-4" />
	<RetirementAccounts401k bind:accounts={retirement_accounts_401k} {people} /> -->
	</div>
</div>
