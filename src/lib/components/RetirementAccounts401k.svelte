<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
    import { Separator } from '$lib/components/ui/separator/index.js';

	import RetirementAccount401k from './RetirementAccount401k.svelte';
	import type { RetirementAccount401kParameters } from '$lib/model/retirement_account_401k';
	import type { Person as PersonType } from '$lib/model/person';

	export let accounts: RetirementAccount401kParameters[];
	export let people: PersonType[];

	const defaultParams: RetirementAccount401kParameters = {
		id: 0,
		accountName: '',
		employeeName: '',
		initialValue: 0,
		annualReturnRate: 7
	};

	let nextId = 0;

	function addAccount() {
		accounts = [
			...accounts,
			{
				...defaultParams,
				id: nextId,
				accountName: `401k (${nextId})`,
				employeeName: people[0].name
			}
		];
		nextId += 1;
	}

	function removeAccount(account: RetirementAccount401kParameters) {
		accounts = accounts.filter((x) => x.id != account.id);
	}

	function updateAccount(account: RetirementAccount401kParameters) {
		const i = accounts.findIndex((x) => x.id == account.id);
		accounts[i] = account;
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<div>
		<h2 class="text-2xl">401k Accounts</h2>
	</div>

	<Separator />
	<ul class="flex flex-col gap-4">
		{#each accounts as account (account.id)}
			<li>
				<RetirementAccount401k
					{account}
					{people}
					on:remove={(e) => removeAccount(e.detail)}
					on:update={(e) => updateAccount(e.detail)}
				/>
			</li>
		{/each}
	</ul>
	<div>
		<Button on:click={addAccount}>Add</Button>
	</div>
</div>
