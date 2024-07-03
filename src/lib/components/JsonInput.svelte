<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	import { type ModelParameters } from '$lib/model/model';

	export let modelParams: ModelParameters;
	let modelParamStr: string;

	let editing = false;
	$: if (!editing) {
		modelParamStr = JSON.stringify(modelParams, null, 2);
	}

	function jsonRevier(key: string, value: any) {
		if (key == 'birthday' || key.endsWith('Date')) {
			return new Date(value);
		}
		return value;
	}

	function onEdit() {
		editing = true;
	}
	function onSave() {
		modelParams = JSON.parse(modelParamStr, jsonRevier);
		editing = false;
	}

	function onCancel() {
		editing = false;
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<div>
		<h2 class="text-2xl">JSON Config</h2>
		<p class="text-muted-foreground">The raw JSON config for the simulator.</p>
	</div>

	<Separator class="mb-5" />

	<div class="grid w-full flex-grow items-center gap-3">
		<Textarea disabled={!editing} class="h-72 font-mono" bind:value={modelParamStr} />

		{#if editing}
			<div class="flex justify-between">
				<Button on:click={onSave}>Save</Button>
				<Button variant="outline" on:click={onCancel}>Cancel</Button>
			</div>
		{:else}
			<div>
				<Button variant="secondary" on:click={onEdit}>Edit</Button>
			</div>
		{/if}
	</div>
</div>
