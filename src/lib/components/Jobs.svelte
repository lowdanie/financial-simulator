<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	import Job from './Job.svelte';
	import { type JobParameters, generateJobId } from '$lib/model/job';
	import type { Person as PersonType } from '$lib/model/person';

	export let jobs: JobParameters[];
	export let people: PersonType[];

	const defaultJobParams: JobParameters = {
		id: 0,
		companyName: '',
		employeeId: 0,
		startDate: new Date(2025, 0, 1),
		endDate: new Date(2035, 0, 1),
		initialSalary: 100000,
		initialBonus: 20000,
		bonusMonth: 12,
		realRaiseRate: 1,

		percentOfMax401kContribution: 100,
		company401kMatchRate: 10,
		initial401kValue: 0,
		annual401kReturnRate: 7
	};

	function addJob() {
		const jobId = generateJobId();
		jobs = [
			...jobs,
			{
				...defaultJobParams,
				id: jobId,
				companyName: `Company (${jobId})`,
				employeeId: people[0].id
			}
		];
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
	<div>
		<h2 class="text-2xl">Jobs</h2>
	</div>

	<Separator />

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
