<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Job from './Job.svelte';
	import type { JobParameters } from '$lib/model/job';
	import type { Person as PersonType } from '$lib/model/person';

	export let jobs: JobParameters[] = [];
	export let people: PersonType[];

	const defaultJobParams: JobParameters = {
		id: 0,
		companyName: 'company',
		employeeName: 'alice',
		startDate: new Date(2025, 0, 1),
		endDate: new Date(2035, 0, 1),
		initialSalary: 100000,
		initialBonus: 20000,
		bonusMonth: 12,
		percentOfMax401kContribution: 100,
		company401kMatchRate: 10,
		realRaiseRate: 1
	};

	let nextId = 0;

	function addJob() {
		jobs = [...jobs, { ...defaultJobParams, id: nextId, employeeName: people[0].name }];
		nextId += 1;
	}

	function removeJob(job: JobParameters) {
		jobs = jobs.filter((x) => x.id != job.id);
	}

	function updateJob(job: JobParameters) {
		const i = jobs.findIndex((x) => x.id == job.id);
		jobs[i] = job;
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<h2 class="text-2xl">Jobs</h2>

	<ul class="flex flex-col gap-4">
		{#each jobs as job (job.id)}
			<li>
				<Job
					jobParams={job}
                    {people}
					on:remove={(e) => removeJob(e.detail)}
					on:update={(e) => updateJob(e.detail)}
				/>
			</li>
		{/each}
	</ul>
	<div>
		<Button on:click={addJob}>Add</Button>
	</div>
</div>
