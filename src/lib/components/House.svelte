<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import NumberInput from './NumberInput.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';

	import type { HouseParameters } from '$lib/model/house';
	import { dateToInputMonthString, inputMonthStringToDate } from '$lib/model/date_utils';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	export let houseParams: HouseParameters;
	export let modelStartYear: number;

	$: modelStartDate = new Date(modelStartYear, 0);

	let updatedHouseParams: HouseParameters;
	let updatedDateStrings: {
		buyDate: string;
		sellDate: string;
	};

	let editing = false;

	function onEdit() {
		updatedHouseParams = { ...houseParams };
		updatedDateStrings = {
			buyDate: dateToInputMonthString(houseParams.buyDate),
			sellDate: dateToInputMonthString(houseParams.sellDate)
		};
		console.log(`edit date string: ${updatedDateStrings.buyDate}`);
		editing = true;
	}
	function onSave() {
		console.log(`save date string: ${updatedDateStrings.buyDate}`);
		updatedHouseParams.buyDate = inputMonthStringToDate(updatedDateStrings.buyDate);
		updatedHouseParams.sellDate = inputMonthStringToDate(updatedDateStrings.sellDate);

		houseParams = { ...updatedHouseParams };
		dispatch('update', houseParams);
		editing = false;
	}

	function onCancel() {
		editing = false;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{editing ? updatedHouseParams.name : houseParams.name}</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if editing}
			<form on:submit|preventDefault={onSave} class="grid w-full items-center gap-4">
				<div class="flex items-center gap-2">
					<Label for="house-name-{houseParams.id}">Name</Label>
					<Input
						bind:value={updatedHouseParams.name}
						type="text"
						id="house-name-{houseParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="home-buy-date-{houseParams.id}">Buy Date</Label>
					<Input
						bind:value={updatedDateStrings.buyDate}
						type="month"
						id="home-buy-date-{houseParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="home-sell-date-{houseParams.id}">Sell Date</Label>
					<Input
						bind:value={updatedDateStrings.sellDate}
						type="month"
						id="home-sell-date-{houseParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="home-value-{houseParams.id}">Home Value</Label>
					<NumberInput bind:value={updatedHouseParams.homeValue} id="home-value-{houseParams.id}" />
				</div>
				<div class="flex items-center gap-2">
					<Label for="home-value-growth-{houseParams.id}">Home Value Annual Growth Rate</Label>
					<NumberInput
						bind:value={updatedHouseParams.homeValueAnnualGrowthRate}
						id="home-value-growth-{houseParams.id}"
					/>
				</div>

				<Separator />

				<div class="flex items-center gap-2">
					<Label for="home-mortgage-rate-{houseParams.id}">Mortgage Rate</Label>
					<NumberInput
						bind:value={updatedHouseParams.mortgageRate}
						id="home-mortgage-rate-{houseParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="home-mortgage-length-{houseParams.id}">Mortgage Length</Label>
					<NumberInput
						bind:value={updatedHouseParams.mortgageLengthYears}
						id="home-mortgage-length-{houseParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="home-mortgage-down-{houseParams.id}">Down Payment Rate</Label>
					<NumberInput
						bind:value={updatedHouseParams.downPaymentRate}
						id="home-mortgage-down-{houseParams.id}"
					/>
				</div>

				{#if new Date(updatedDateStrings.buyDate) < modelStartDate}
					<div class="flex items-center gap-2">
						<Label for="home-remaining-principal-{houseParams.id}">Remaining Principal</Label>
						<NumberInput
							bind:value={updatedHouseParams.remainingPrincipal}
							id="home-remaining-principal-{houseParams.id}"
						/>
					</div>
					<div class="flex items-center gap-2">
						<Label for="home-buy-price-{houseParams.id}">Home Buy Price</Label>
						<NumberInput
							bind:value={updatedHouseParams.homeBuyPrice}
							id="home-buy-price-{houseParams.id}"
						/>
					</div>
				{/if}

				<Separator />

				<div class="flex items-center gap-2">
					<Label for="home-common-{houseParams.id}">Monthly Common Fee</Label>
					<NumberInput
						bind:value={updatedHouseParams.monthlyCommonFee}
						id="home-common-{houseParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="home-tax-{houseParams.id}">Property Tax Rate</Label>
					<NumberInput
						bind:value={updatedHouseParams.propertyTaxRate}
						id="home-tax-{houseParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="home-insurance-{houseParams.id}">Insurance Rate</Label>
					<NumberInput
						bind:value={updatedHouseParams.insuranceRate}
						id="home-insurance-{houseParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="home-maintenance-{houseParams.id}">Maintenance Rate</Label>
					<NumberInput
						bind:value={updatedHouseParams.maintenanceRate}
						id="home-maintenance-{houseParams.id}"
					/>
				</div>

				<Separator />

				<div class="flex items-center gap-2">
					<Label for="home-closing-{houseParams.id}">Closing Cost Rate</Label>
					<NumberInput
						bind:value={updatedHouseParams.closingCostRate}
						id="home-closing-{houseParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="home-closing-{houseParams.id}">Closing Cost Rate</Label>
					<NumberInput
						bind:value={updatedHouseParams.sellingCostRate}
						id="home-closing-{houseParams.id}"
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
					<div class="text-sm font-medium">Name</div>
					<div class="text-sm">{houseParams.name}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Buy Date</div>
					<div class="text-sm">{dateToInputMonthString(houseParams.buyDate)}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Sell Date</div>
					<div class="text-sm">{dateToInputMonthString(houseParams.sellDate)}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Home Value</div>
					<div class="text-sm">{houseParams.homeValue}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Home Value Annual Growth Rate</div>
					<div class="text-sm">{houseParams.homeValueAnnualGrowthRate}</div>
				</div>

				<Separator />

				<div class="flex gap-2">
					<div class="text-sm font-medium">Mortgage Rate</div>
					<div class="text-sm">{houseParams.mortgageRate}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Mortgage Length</div>
					<div class="text-sm">{houseParams.mortgageLengthYears}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Down Payment Rate</div>
					<div class="text-sm">{houseParams.downPaymentRate}</div>
				</div>

				{#if new Date(houseParams.buyDate) < modelStartDate}
					<div class="flex gap-2">
						<div class="text-sm font-medium">Remaining Principal</div>
						<div class="text-sm">{houseParams.remainingPrincipal}</div>
					</div>
					<div class="flex gap-2">
						<div class="text-sm font-medium">Home Buy Price</div>
						<div class="text-sm">{houseParams.remainingPrincipal}</div>
					</div>
				{/if}

				<Separator />

				<div class="flex gap-2">
					<div class="text-sm font-medium">Monthly Common Fee</div>
					<div class="text-sm">{houseParams.monthlyCommonFee}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Property Tax Rate</div>
					<div class="text-sm">{houseParams.propertyTaxRate}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Insurance Rate</div>
					<div class="text-sm">{houseParams.insuranceRate}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Maintenance Rate</div>
					<div class="text-sm">{houseParams.maintenanceRate}</div>
				</div>

				<Separator />

				<div class="flex gap-2">
					<div class="text-sm font-medium">Closing Cost Rate</div>
					<div class="text-sm">{houseParams.closingCostRate}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Selling Cost Rate</div>
					<div class="text-sm">{houseParams.sellingCostRate}</div>
				</div>

				<div class="flex justify-between">
					<Button variant="secondary" on:click={onEdit}>Edit</Button>
					<Button variant="destructive" on:click={() => dispatch('remove', houseParams)}
						>Delete</Button
					>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
