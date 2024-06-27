<script lang="ts">
	import Chart from 'chart.js/auto';

	import { Separator } from '$lib/components/ui/separator/index.js';

	import type { ModelParameters } from '$lib/model/model';
	import { type Forecast, type DateValue, simulate } from '$lib/model/simulator';

	export let modelParams: ModelParameters;
	$: forecast = simulate(modelParams);

	function getFinalNetWorth(modelParams: ModelParameters): number {
		let forecast = simulate(modelParams);
		return forecast.netWorth[forecast.netWorth.length - 1].value;
	}

	function getLabel(dateValue: DateValue): string {
		return `${dateValue.date.getMonth() + 1}/${dateValue.date.getFullYear()}`;
	}

	function makeChart(ctx: HTMLCanvasElement, forecast: Forecast) {
		const chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: forecast.netWorth.map(getLabel),
				datasets: [
					{
						label: 'Net Worth',
						data: forecast.netWorth.map((x) => x.value)
					}
				]
			},
			options: {
				elements: {
					point: {
						pointStyle: false
					},
					line: {
						borderColor: '#0f182a'
					}
				},
				plugins: {
					legend: {
						display: false
					}
				}
			}
		});
		return {
			update(forecast: Forecast) {
				chart.data.labels = forecast.netWorth.map(getLabel);
				chart.data.datasets[0].data = forecast.netWorth.map((x) => x.value);
				chart.update();
			},
			destroy() {
				chart.destroy();
			}
		};
	}
</script>

<!-- <div class="flex gap-2">
	<div>Final Net Worth</div>
	<div>{getFinalNetWorth(modelParams)}</div>
</div> -->

<div class="flex-grow">
	<div class="flex flex-col">
		<div>
			<h2 class="text-2xl">Forecast</h2>
			<p class="text-muted-foreground">Net worth over time</p>
		</div>

		<Separator class="mb-5" />

		<canvas use:makeChart={forecast} class="w-full" />
	</div>
</div>
