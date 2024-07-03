<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	import RetirementAccount401k from './RetirementAccount401k.svelte';
	import {
		type RetirementAccount401kParameters,
		generateRetirement401kId
	} from '$lib/model/retirement_account_401k';
	import type { Person as PersonType } from '$lib/model/person';

	export let accounts: RetirementAccount401kParameters[];
	export let people: PersonType[];

	const defaultParams: RetirementAccount401kParameters = {
		id: 0,
		accountName: '',
		employeeId: 0,
		initialValue: 0,
		annualReturnRate: 7
	};

	function addAccount() {
		const accountId = generateRetirement401kId();
		accounts = [
			...accounts,
			{
				...defaultParams,
				id: accountId,
				accountName: `401k (${accountId})`,
				employeeId: people[0].id
			}
		];
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
		<Button disabled={people.length == 0} on:click={addAccount}>Add</Button>
	</div>
</div>
