<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import { type GeneralParameters as GeneralType } from '$lib/model/model';

	export let params: GeneralType;

	let updatedParams: GeneralType = { ...params };
	let editing = false;

	function onSave() {
		params = { ...updatedParams };
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

	<Separator class="mb-5"/>

	{#if editing}
		<form on:submit|preventDefault={onSave} class="grid w-full items-center gap-4">
			<div class="flex items-center gap-2">
				<Label for="general-start">Start Year</Label>
				<Input bind:value={updatedParams.startYear} type="number" id="general-start" />
			</div>
			<div class="flex items-center gap-2">
				<Label for="general-duration">Duration</Label>
				<Input bind:value={updatedParams.durationYears} type="number" id="general-duration" />
			</div>
			<div class="flex items-center gap-2">
				<Label for="general-inflation">Inflation Rate</Label>
				<Input bind:value={updatedParams.inflationRate} type="number" id="general-inflation" />
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
				<span class="text-sm">{params.startYear}</span>
			</div>
			<div class="flex gap-2">
				<span class="text-sm font-medium">Duration</span>
				<span class="text-sm">{params.durationYears}</span>
			</div>
			<div class="flex gap-2">
				<span class="text-sm font-medium">Inflation Rate</span>
				<span class="text-sm">{params.inflationRate}</span>
			</div>
			<div>
				<Button variant="secondary" on:click={() => (editing = true)}>Edit</Button>
			</div>
		</div>
	{/if}
</div>
