<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';

	export let value: number = 0;
    export let id: string;

	let updatedValue: string = value.toString();

	$: value = parseInt(updatedValue);
</script>

<Input bind:value={updatedValue} type="number" id={id} />
