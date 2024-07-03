<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	import PersonInput from './PersonInput.svelte';
	import { type Person } from '$lib/model/person';
	import { generatePersonId } from '$lib/model/model';
	import type { JobParameters } from '$lib/model/job';
	import type { RetirementAccount401kParameters } from '$lib/model/retirement_account_401k';

	export let people: Person[];
	export let jobs: JobParameters[];
	export let retirement401kAccounts: RetirementAccount401kParameters[];

	const defaultPerson: Person = {
		id: 0,
		name: '',
		birthday: new Date(1990, 0)
	};

	function personInUse(person: Person): boolean {
		return (
			jobs.findIndex((job) => job.employeeId == person.id) >= 0 ||
			retirement401kAccounts.findIndex((account) => account.employeeId == person.id) >= 0
		);
	}

	function addPerson() {
		const personId = generatePersonId();
		people = [...people, { ...defaultPerson, id: personId, name: `Person (${personId})` }];
	}

	function removePerson(person: Person) {
		people = people.filter((x) => x.id != person.id);
	}

	function updatePerson(person: Person) {
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
				<PersonInput
					{person}
					personInUse={personInUse(person)}
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
