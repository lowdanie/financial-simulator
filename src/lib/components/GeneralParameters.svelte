<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import NumberInput from './NumberInput.svelte';

	import { FilingStatus, type TaxManagerParameters } from '$lib/model/tax_manager';

	export let startYear: number;
	export let durationYears: number;
	export let inflationRate: number;
	export let targetEmergencyFund: number;
	export let taxParams: TaxManagerParameters;

	let updatedParams: {
		startYear: number;
		durationYears: number;
		inflationRate: number;
		targetEmergencyFund: number;
		taxParams: TaxManagerParameters;
	};

	interface FilingStatusSelection {
		label: string;
		value: FilingStatus;
	}

	const filingStatusSelections: FilingStatusSelection[] = [
		{ label: FilingStatus.JOINT.toString(), value: FilingStatus.JOINT },
		{ label: FilingStatus.SINGLE.toString(), value: FilingStatus.SINGLE }
	];

	let selectedFilingStatus: FilingStatusSelection;

	let editing = false;

	function onEdit() {
		updatedParams = {
			startYear: startYear,
			durationYears: durationYears,
			inflationRate: inflationRate,
			targetEmergencyFund: targetEmergencyFund,
			taxParams: { ...taxParams }
		};
		selectedFilingStatus = {
			label: taxParams.filingStatus.toString(),
			value: taxParams.filingStatus
		};

		editing = true;
	}

	function onSave() {
		({ startYear, durationYears, inflationRate, targetEmergencyFund, taxParams } = updatedParams);
		taxParams.filingStatus = selectedFilingStatus.value;
		editing = false;
	}

	function onCancel() {
		editing = false;
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<div>
		<h2 class="text-2xl">General</h2>
	</div>

	<Separator class="mb-5" />

	{#if editing}
		<form on:submit|preventDefault={onSave} class="grid w-full items-center gap-4">
			<div class="flex items-center gap-2">
				<Label for="general-start">Start Year</Label>
				<NumberInput bind:value={updatedParams.startYear} id="general-start" />
			</div>
			<div class="flex items-center gap-2">
				<Label for="general-duration">Duration</Label>
				<NumberInput bind:value={updatedParams.durationYears} id="general-duration" />
			</div>
			<div class="flex items-center gap-2">
				<Label for="general-inflation">Inflation Rate</Label>
				<NumberInput bind:value={updatedParams.inflationRate} id="general-inflation" />
			</div>
			<div class="flex items-center gap-2">
				<Label for="general-emergency">Target Emergency Fund</Label>
				<NumberInput bind:value={updatedParams.targetEmergencyFund} id="general-emergency" />
			</div>
			<div class="flex items-center gap-2">
				<Label for="general-filing-status">Tax Filing Status</Label>
				<Select.Root bind:selected={selectedFilingStatus}>
					<Select.Trigger id="general-filing-status">
						<Select.Value placeholder="Select a filing status" />
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Filing Status</Select.Label>
							{#each filingStatusSelections as s}
								<Select.Item value={s.value} label={s.label}>{s.label}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex items-center gap-2">
				<Label for="general-state-tax">Effective State Income Tax Rate</Label>
				<NumberInput
					bind:value={updatedParams.taxParams.effectiveStateTaxRate}
					id="general-state-tax"
				/>
			</div>
			<div class="flex justify-between">
				<Button type="submit">Save</Button>
				<Button variant="outline" on:click={onCancel}>Cancel</Button>
			</div>
		</form>
	{:else}
		<div class="grid w-full items-center gap-3">
			<div class="flex gap-2">
				<span class="text-sm font-medium">Start Year</span>
				<span class="text-sm">{startYear}</span>
			</div>
			<div class="flex gap-2">
				<span class="text-sm font-medium">Duration</span>
				<span class="text-sm">{durationYears}</span>
			</div>
			<div class="flex gap-2">
				<span class="text-sm font-medium">Inflation Rate</span>
				<span class="text-sm">{inflationRate}</span>
			</div>
			<div class="flex gap-2">
				<span class="text-sm font-medium">Target Emergency Fund</span>
				<span class="text-sm">{targetEmergencyFund}</span>
			</div>
			<div class="flex gap-2">
				<span class="text-sm font-medium">Tax Filing Status</span>
				<span class="text-sm">{taxParams.filingStatus.toString()}</span>
			</div>
			<div class="flex gap-2">
				<span class="text-sm font-medium">Effective State Income Tax Rate</span>
				<span class="text-sm">{taxParams.effectiveStateTaxRate}</span>
			</div>
			<div>
				<Button variant="secondary" on:click={onEdit}>Edit</Button>
			</div>
		</div>
	{/if}
</div>
