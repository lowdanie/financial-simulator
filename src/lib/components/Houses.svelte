<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	import House from './House.svelte';
	import { type HouseParameters, generateHouseId } from '$lib/model/house';

	export let houses: HouseParameters[];
	export let modelStartYear: number;

	const defaultHouseParams: HouseParameters = {
		id: 0,
		name: '',
		buyDate: new Date(modelStartYear, 0),
		sellDate: new Date(modelStartYear + 30, 0),
		homeValue: 500000,
		homeValueAnnualGrowthRate: 3,
		mortgageRate: 7,
		mortgageLengthYears: 30,
		downPaymentRate: 20,
		monthlyCommonFee: 500,
		propertyTaxRate: 1,
		insuranceRate: 1,
		maintenanceRate: 2,
		closingCostRate: 5,
		sellingCostRate: 5
	};

	function addHouse() {
		const houseId = generateHouseId();
		houses = [...houses, { ...defaultHouseParams, id: houseId, name: `House (${houseId})` }];
	}

	function removeHouse(house: HouseParameters) {
		houses = houses.filter((x) => x.id != house.id);
	}

	function updateHouse(house: HouseParameters) {
		const i = houses.findIndex((x) => x.id == house.id);
		houses[i] = house;
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<div>
		<h2 class="text-2xl">Houses</h2>
	</div>

	<Separator />

	<ul class="flex flex-col gap-4">
		{#each houses as houseParams (houseParams.id)}
			<li>
				<House
					{houseParams}
					{modelStartYear}
					on:remove={(e) => removeHouse(e.detail)}
					on:update={(e) => updateHouse(e.detail)}
				/>
			</li>
		{/each}
	</ul>
	<div>
		<Button on:click={addHouse}>Add</Button>
	</div>
</div>
