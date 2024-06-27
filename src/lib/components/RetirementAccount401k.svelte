<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import NumberInput from './NumberInput.svelte';

	import type { RetirementAccount401kParameters } from '$lib/model/retirement_account_401k';
	import type { Person } from '$lib/model/person';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	export let account: RetirementAccount401kParameters;
	export let people: Person[];

	let updatedAccount: RetirementAccount401kParameters = { ...account };
	let editing = false;
	let selectedPerson = { value: people[0].name, label: people[0].name };

	function onSave() {
		account = { ...updatedAccount };
		dispatch('update', account);
		editing = false;
	}

	function onCancel() {
		editing = false;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{editing ? updatedAccount.accountName : account.accountName}</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if editing}
			<form on:submit|preventDefault={onSave} class="grid w-full items-center gap-4">
				<div class="flex items-center gap-2">
					<Label for="401k-name-{account.id}">Name</Label>
					<Input bind:value={updatedAccount.accountName} type="text" id="401k-name-{account.id}" />
				</div>
				<div class="flex items-center gap-2">
					<Label for="401k-employee-{account.id}">Employee</Label>
					<Select.Root bind:selected={selectedPerson}>
						<Select.Trigger id="401-employee-{account.id}">
							<Select.Value placeholder="Select an employee" />
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>People</Select.Label>
								{#each people as person}
									<Select.Item value={person.name} label={person.name}>{person.name}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex items-center gap-2">
					<Label for="401k-value-{account.id}">Initial Value</Label>
					<NumberInput bind:value={updatedAccount.initialValue} id="401k-value-{account.id}" />
				</div>
				<div class="flex items-center gap-2">
					<Label for="401k-return-{account.id}">Annual Return Rate</Label>
					<NumberInput bind:value={updatedAccount.annualReturnRate} id="401k-return-{account.id}" />
				</div>
				<div class="flex justify-between">
					<Button type="submit">Save</Button>
					<Button variant="outline" on:click={onCancel}>Cancel</Button>
				</div>
			</form>
		{:else}
			<div class="grid w-full items-center gap-2">
				<div class="flex gap-2">
					<span class="text-sm font-medium">Name</span>
					<span class="text-sm">{account.accountName}</span>
				</div>
				<div class="flex gap-2">
					<span class="text-sm font-medium">Employee</span>
					<span class="text-sm">{account.employeeName}</span>
				</div>
				<div class="flex gap-2">
					<span class="text-sm font-medium">Initial Value</span>
					<span class="text-sm">{account.initialValue}</span>
				</div>
				<div class="flex gap-2">
					<span class="text-sm font-medium">Annual Return Rate</span>
					<span class="text-sm">{account.annualReturnRate}</span>
				</div>
				<div class="flex justify-between">
					<Button variant="secondary" on:click={() => (editing = true)}>Edit</Button>
					<Button variant="destructive" on:click={() => dispatch('remove', account)}>Delete</Button>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
