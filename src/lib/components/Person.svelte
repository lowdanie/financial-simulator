<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import type { Person } from '$lib/model/person';
	import { dateToInputDateString, inputDateStringToDate } from '$lib/model/date_utils';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	export let person: Person;

	let updatedPerson: Person = { ...person };
	let updatedDateString = dateToInputDateString(updatedPerson.birthday);
	let editing = false;

	function onEdit() {
		updatedPerson = { ...person };
		updatedDateString = dateToInputDateString(updatedPerson.birthday);
		editing = true;
	}
	function onSave() {
		updatedPerson.birthday = inputDateStringToDate(updatedDateString);
		person = { ...updatedPerson };
		dispatch('update', person);
		editing = false;
	}

	function onCancel() {
		editing = false;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{person.name}</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if editing} 
			<form on:submit|preventDefault={onSave} class="grid w-full items-center gap-4">
				<div class="flex items-center gap-2">
					<Label for="person-name-{person.id}">Name</Label>
					<Input bind:value={updatedPerson.name} type="text" id="person-name-{person.id}" />
				</div>
				<div class="flex items-center gap-2">
					<Label for="person-birthday-{person.id}">Birthday</Label>
					<Input bind:value={updatedDateString} type="date" id="person-birthday-{person.id}" />
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
					<span class="text-sm">{person.name}</span>
				</div>
				<div class="flex gap-2">
					<span class="text-sm font-medium">Age</span>
					<span class="text-sm">{dateToInputDateString(person.birthday)}</span>
				</div>
				<div class="flex justify-between">
					<Button variant="secondary" on:click={onEdit}>Edit</Button>
					<Button variant="destructive" on:click={() => dispatch('remove', person)}>Delete</Button>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
