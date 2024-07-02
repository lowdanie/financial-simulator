<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	import Model from './Model.svelte';
	import Forecast from './Forecast.svelte';

	import type { ModelParameters } from '$lib/model/model';
	import { FilingStatus } from '$lib/model/tax_manager';

	let params: ModelParameters = {
		startYear: 2025,
		durationYears: 50,
		inflationRate: 3,
		targetEmergencyFund: 10000,
		people: [],
		jobs: [],
		expenses: [],
		houses: [],
		retirement401kAccounts: [],
		savingsAccount: {
			name: 'Savings Account',
			initialValue: 0,
			annualPercentageYield: 4
		},
		brokerageAccount: {
			accountName: 'Brokerage Account',
			initialValue: 0,
			initialCostBasis: 0,
			annualReturnRate: 7,
			managementFeeRate: 0.5
		},
		taxManager: {
			filingStatus: FilingStatus.JOINT
		}
	};
</script>

<div class="flex flex-col p-10">
	<div class="space-y-0.5">
		<h2 class="text-2xl font-bold tracking-tight">Financial Simulator</h2>
		<p class="text-muted-foreground">Simulate personal finances</p>
	</div>

	<Separator class="my-6" />

	<div class="flex h-fit gap-10">
		<Model bind:params />
		<Forecast modelParams={params} />
	</div>
</div>
