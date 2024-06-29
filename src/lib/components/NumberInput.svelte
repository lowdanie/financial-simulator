<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';

	export let value: number = 0;
	export let id: string;

	let updatedValue: string = value.toString();

	$: value = parseFloat(updatedValue);
</script>

<Input bind:value={updatedValue} type="number" {id} step="0.01" />
