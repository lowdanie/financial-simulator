<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import NumberInput from './NumberInput.svelte';

	import type { JobParameters } from '$lib/model/job';
	import type { Person as PersonType } from '$lib/model/person';
	import { dateToInputMonthString, inputMonthStringToDate } from '$lib/model/date_utils';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	export let jobParams: JobParameters;
	export let people: PersonType[];

	let updatedJobParams: JobParameters;
	let updatedDateStrings: {
		startDate: string;
		endDate: string;
	};

	let selectedPerson: {
		value: string;
		label: string;
	};

	let editing = false;

	function onEdit() {
		updatedJobParams = { ...jobParams };
		updatedDateStrings = {
			startDate: dateToInputMonthString(jobParams.startDate),
			endDate: dateToInputMonthString(jobParams.endDate)
		};
		selectedPerson = { value: jobParams.employeeName, label: jobParams.employeeName };

		editing = true;
	}
	function onSave() {
		updatedJobParams.startDate = inputMonthStringToDate(updatedDateStrings.startDate);
		updatedJobParams.endDate = inputMonthStringToDate(updatedDateStrings.endDate);

		jobParams = { ...updatedJobParams };
		dispatch('update', jobParams);
		editing = false;
	}

	function onCancel() {
		editing = false;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{jobParams.companyName}</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if editing}
			<form on:submit|preventDefault={onSave} class="grid w-full items-center gap-4">
				<div class="flex items-center gap-2">
					<Label for="job-company-name-{jobParams.id}">Company</Label>
					<Input
						bind:value={updatedJobParams.companyName}
						type="text"
						id="job-company-name-{jobParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="job-employee-{jobParams.id}">Employee</Label>
					<Select.Root bind:selected={selectedPerson}>
						<Select.Trigger id="job-employee-{jobParams.id}">
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
					<Label for="job-start-date-{jobParams.id}">Start Date</Label>
					<Input
						bind:value={updatedDateStrings.startDate}
						type="month"
						id="job-start-date-{jobParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="job-end-date-{jobParams.id}">End Date</Label>
					<Input
						bind:value={updatedDateStrings.endDate}
						type="month"
						id="job-end-date-{jobParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="job-initial-salary-{jobParams.id}">Initial Salary</Label>
					<NumberInput
						bind:value={updatedJobParams.initialSalary}
						id="job-initial-salary-{jobParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="job-initial-bonus-{jobParams.id}">Initial Bonus</Label>
					<NumberInput
						bind:value={updatedJobParams.initialBonus}
						id="job-initial-bonus-{jobParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="job-bonus-month-{jobParams.id}">Bonus Month</Label>
					<NumberInput
						bind:value={updatedJobParams.bonusMonth}
						id="job-bonus-month-{jobParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="job-percent-401k-{jobParams.id}">Percent of Max 401k</Label>
					<NumberInput
						bind:value={updatedJobParams.percentOfMax401kContribution}
						id="job-percent-401k-{jobParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="job-401k-match-rate{jobParams.id}">401k Match Rate</Label>
					<NumberInput
						bind:value={updatedJobParams.company401kMatchRate}
						id="job-401k-match-rate{jobParams.id}"
					/>
				</div>
				<div class="flex items-center gap-2">
					<Label for="job-real-raise-rate{jobParams.id}">Real Raise Rate</Label>
					<NumberInput
						bind:value={updatedJobParams.realRaiseRate}
						id="job-real-raise-rate{jobParams.id}"
					/>
				</div>
				<div class="flex justify-between">
					<Button type="submit">Save</Button>
					<Button variant="outline" on:click={onCancel}>Cancel</Button>
				</div>
			</form>
		{:else}
			<div class="grid w-full items-center gap-2">
				<div class="flex gap-2">
					<div class="text-sm font-medium">Company</div>
					<div class="text-sm">{jobParams.companyName}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Employee</div>
					<div class="text-sm">{jobParams.employeeName}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Start Date</div>
					<div class="text-sm">{dateToInputMonthString(jobParams.startDate)}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">End Date</div>
					<div class="text-sm">{dateToInputMonthString(jobParams.endDate)}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Initial Salary</div>
					<div class="text-sm">{jobParams.initialSalary}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Initial Bonus</div>
					<div class="text-sm">{jobParams.initialBonus}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Bonus Month</div>
					<div class="text-sm">{jobParams.bonusMonth}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Percent of Max 401k</div>
					<div class="text-sm">{jobParams.percentOfMax401kContribution}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">401k Match Rate</div>
					<div class="text-sm">{jobParams.company401kMatchRate}</div>
				</div>
				<div class="flex gap-2">
					<div class="text-sm font-medium">Real Raise Rate</div>
					<div class="text-sm">{jobParams.realRaiseRate}</div>
				</div>
				<div class="flex justify-between">
					<Button variant="secondary" on:click={onEdit}>Edit</Button>
					<Button variant="destructive" on:click={() => dispatch('remove', jobParams)}
						>Delete</Button
					>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
