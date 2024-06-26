<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import type { SavingsAccountParameters } from '$lib/model/savings_account';

	export let account: SavingsAccountParameters;

	let updatedAccount: SavingsAccountParameters = { ...account };
	let editing = false;

	function onSave() {
		account = { ...updatedAccount };
		editing = false;
	}

	function onCancel() {
		editing = false;
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<div>
		<h2 class="text-2xl">Savings Account</h2>
		<p class="text-muted-foreground">The default location to store cash</p>
	</div>

	<Separator class="mb-5"/>

	{#if editing}
		<form on:submit|preventDefault={onSave} class="grid w-full items-center gap-4">
			<div class="flex items-center gap-2">
				<Label for="savings-name">Name</Label>
				<Input bind:value={updatedAccount.name} type="text" id="savings-name" />
			</div>
			<div class="flex items-center gap-2">
				<Label for="savings-value">Initial Value</Label>
				<Input bind:value={updatedAccount.initialValue} type="number" id="savings-value" />
			</div>
			<div class="flex items-center gap-2">
				<Label for="savings-apy">Annual Percentage Yield</Label>
				<Input bind:value={updatedAccount.annualPercentageYield} type="number" id="savings-apy" />
			</div>
			<div class="flex justify-between">
				<Button type="submit">Save</Button>
				<Button variant="outline" on:click={onCancel}>Cancel</Button>
			</div>
		</form>
	{:else}
		<div class="grid w-full items-center gap-3">
			<div class="flex gap-2">
				<span class="text-sm font-medium">Name</span>
				<span class="text-sm">{account.name}</span>
			</div>
			<div class="flex gap-2">
				<span class="text-sm font-medium">Initial Value</span>
				<span class="text-sm">{account.initialValue}</span>
			</div>
			<div class="flex gap-2">
				<span class="text-sm font-medium">Annual Percentage Yield</span>
				<span class="text-sm">{account.annualPercentageYield}</span>
			</div>
			<div>
				<Button variant="secondary" on:click={() => (editing = true)}>Edit</Button>
			</div>
		</div>
	{/if}
</div>
