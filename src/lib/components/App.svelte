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
		people: [],
		jobs: [],
		expenses: [],
		retirement401kAccounts: [],
		savingsAccount: {
			name: 'Savings Account',
			initialValue: 0,
			annualPercentageYield: 4
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

	<div class="flex gap-10 h-fit">
		<Model bind:params />
		<Forecast modelParams={params} />
	</div>
</div>
