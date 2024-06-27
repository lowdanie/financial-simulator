<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	import Person from './Person.svelte';
	import type { Person as PersonType } from '$lib/model/person';
	// import type {JobParameters} from '$lib/model/job';

	export let people: PersonType[];
	// export let jobs: JobParameters[];

	let nextId = people.length;

	function addPerson() {
		people = [...people, { name: 'Unknown', birthday: new Date(1990, 0, 1), id: nextId }];
		nextId += 1;
	}

	function removePerson(person: PersonType) {
		people = people.filter((x) => x.id != person.id);
	}

	function updatePerson(person: PersonType) {
		const i = people.findIndex((p) => p.id == person.id);
		people[i] = person;
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<div>
		<h2 class="text-2xl">People</h2>
		<p class="text-muted-foreground">The members of the household</p>
	</div>

	<Separator />

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
