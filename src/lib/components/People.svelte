<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Person from './Person.svelte';
	import type { Person as PersonType } from '$lib/model/person';

	let people: PersonType[] = [
		{ name: 'alice', age: 30, id: 0 },
		{ name: 'bob', age: 25, id: 1 }
	];

	let nextId = people.length;

	function addPerson() {
		people = [...people, { name: 'Unknown', age: 0, id: nextId }];
		nextId += 1;
	}

	function removePerson(person: PersonType) {
		people = people.filter((x) => x.id != person.id);
	}

	function updatePerson(person: PersonType) {
		const i = people.findIndex((p) => p.id == person.id);
		people[i] = person;
		console.log(`people: ${JSON.stringify(people)}`);
	}
</script>

<div class="flex w-60 flex-col gap-2 p-2">
	<h2 class="text-2xl">People</h2>

	<ul class="flex flex-col gap-4">
		{#each people as person (person.id)}
			<li>
				<Person
					{person}
					on:remove={(e) => removePerson(e.detail)}
					on:update={(e) => updatePerson(e.detail)}
				/>
			</li>
		{/each}
	</ul>
	<div>
		<Button on:click={addPerson}>Add</Button>
	</div>
</div>
