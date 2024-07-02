<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';

	import People from './People.svelte';
	import Jobs from './Jobs.svelte';
	import Expenses from './Expenses.svelte';
	import RetirementAccounts401k from './RetirementAccounts401k.svelte';
	import SavingsAccount from './SavingsAccount.svelte';
	import GeneralParameters from './GeneralParameters.svelte';
	import Houses from './Houses.svelte';

	import type { ModelParameters } from '$lib/model/model';
	import Brokerage from './Brokerage.svelte';

	export let params: ModelParameters;

	let paramNames = [
		'General',
		'People',
		'Jobs',
		'Expenses',
		'Houses',
		'Savings Account',
		'Brokerage Account',
		'401k Accounts'
	];
	let activeParamName = 'General';

	function getDisplayType(isActive: boolean): string {
		if (isActive) {
			return 'block';
		}

		return 'hidden';
	}
</script>

<div class="flex gap-10">
	<div class="flex w-40 flex-col items-stretch gap-2">
		{#each paramNames as paramName}
			<Button class="justify-start" variant="ghost" on:click={() => (activeParamName = paramName)}
				>{paramName}</Button
			>
		{/each}
	</div>

	<div class="w-80">
		<div class={getDisplayType(activeParamName == 'General')}>
			<GeneralParameters
				bind:startYear={params.startYear}
				bind:durationYears={params.durationYears}
				bind:inflationRate={params.inflationRate}
				bind:targetEmergencyFund={params.targetEmergencyFund}
				bind:taxParams={params.taxManager}
			/>
		</div>
		<div class={getDisplayType(activeParamName == 'People')}>
			<People bind:people={params.people} />
		</div>
		<div class={getDisplayType(activeParamName == 'Jobs')}>
			<Jobs bind:jobs={params.jobs} people={params.people} />
		</div>
		<div class={getDisplayType(activeParamName == 'Expenses')}>
			<Expenses bind:expenses={params.expenses} />
		</div>
		<div class={getDisplayType(activeParamName == 'Houses')}>
			<Houses bind:houses={params.houses} modelStartYear={params.startYear} />
		</div>
		<div class={getDisplayType(activeParamName == 'Savings Account')}>
			<SavingsAccount bind:account={params.savingsAccount} />
		</div>
		<div class={getDisplayType(activeParamName == 'Brokerage Account')}>
			<Brokerage bind:account={params.brokerageAccount} />
		</div>
		<div class={getDisplayType(activeParamName == '401k Accounts')}>
			<RetirementAccounts401k
				bind:accounts={params.retirement401kAccounts}
				people={params.people}
			/>
		</div>
	</div>
</div>
