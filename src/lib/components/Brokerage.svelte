<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import NumberInput from './NumberInput.svelte';

	import type { BrokerageAccountParameters } from '$lib/model/brokerage_account';

	export let account: BrokerageAccountParameters;

	let updatedAccount: BrokerageAccountParameters = { ...account };
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
		<h2 class="text-2xl">Brokerage Account</h2>
		<p class="text-muted-foreground">A simple model of a brokerage account containing stocks.</p>
	</div>

	<Separator class="mb-5" />

	{#if editing}
		<form on:submit|preventDefault={onSave} class="grid w-full items-center gap-4">
			<div class="flex items-center gap-2">
				<Label for="brokerage-name">Name</Label>
				<Input bind:value={updatedAccount.accountName} type="text" id="brokerage-name" />
			</div>
			<div class="flex items-center gap-2">
				<Label for="brokerage-value">Initial Value</Label>
				<NumberInput bind:value={updatedAccount.initialValue} id="brokerage-value" />
			</div>
			<div class="flex items-center gap-2">
				<Label for="brokerage-basis">Initial Cost Basis</Label>
				<NumberInput bind:value={updatedAccount.initialCostBasis} id="brokerage-basis" />
			</div>
			<div class="flex items-center gap-2">
				<Label for="brokerage-arr">Annual Return Rate</Label>
				<NumberInput bind:value={updatedAccount.annualReturnRate} id="brokerage-arr" />
			</div>
			<div class="flex items-center gap-2">
				<Label for="brokerage-fee">Management Fee Rate</Label>
				<NumberInput bind:value={updatedAccount.managementFeeRate} id="brokerage-fee" />
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
				<span class="text-sm">{account.accountName}</span>
			</div>
			<div class="flex gap-2">
				<span class="text-sm font-medium">Initial Value</span>
				<span class="text-sm">{account.initialValue}</span>
			</div>
			<div class="flex gap-2">
				<span class="text-sm font-medium">Initial Cost Basis</span>
				<span class="text-sm">{account.initialCostBasis}</span>
			</div>
			<div class="flex gap-2">
				<span class="text-sm font-medium">Annual Return Rate</span>
				<span class="text-sm">{account.annualReturnRate}</span>
			</div>
			<div class="flex gap-2">
				<span class="text-sm font-medium">Management Fee Rate</span>
				<span class="text-sm">{account.managementFeeRate}</span>
			</div>
			<div>
				<Button variant="secondary" on:click={() => (editing = true)}>Edit</Button>
			</div>
		</div>
	{/if}
</div>
