<script lang="ts">
	import Chart, { type ChartDataset, type Point } from 'chart.js/auto';

	import { Separator } from '$lib/components/ui/separator/index.js';

	import type { ModelParameters, MonthSummary } from '$lib/model/model';
	import { type Forecast, simulate } from '$lib/model/simulator';

	export let modelParams: ModelParameters;
	$: forecast = simulate(modelParams);

	type Dataset = ChartDataset<'line', number[]>;

	const PRIMARY_LINE_COLOR = '#0f182a';
	const SECONDARY_LINE_COLORS = ['#3ec2fa', '#00d0ea', '#00d8bd', '#58da7e', '#b0d33d', '#ffc014'];

	function getLabel(monthSummary: MonthSummary): string {
		return `${monthSummary.date.getMonth() + 1}/${monthSummary.date.getFullYear()}`;
	}

	function buildLabels(forecast: Forecast): string[] {
		return forecast.monthSummaries.map(getLabel);
	}

	function buildDatasets(forecast: Forecast): Dataset[] {
		console.log('building datasets...');

		if (forecast.monthSummaries.length == 0) {
			return [];
		}
		let colorIdx = 0;
		let netWorthDataset: Dataset = {
			label: 'Net Worth',
			data: [],
			borderColor: PRIMARY_LINE_COLOR,
			backgroundColor: PRIMARY_LINE_COLOR
		};

		let assetDatasets: Dataset[] = [];
		for (let asset of forecast.monthSummaries[0].assets) {
			console.log('adding asset', asset.name);
			assetDatasets.push({
				label: asset.name,
				data: [],
				borderColor: SECONDARY_LINE_COLORS[colorIdx],
				backgroundColor: SECONDARY_LINE_COLORS[colorIdx]
			});
			colorIdx = (colorIdx + 1) % SECONDARY_LINE_COLORS.length;
		}

		for (let monthSummary of forecast.monthSummaries) {
			netWorthDataset.data.push(monthSummary.netWorth);
			for (let i = 0; i < monthSummary.assets.length; i++) {
				assetDatasets[i].data.push(monthSummary.assets[i].value);
			}
		}

		const datasets = [netWorthDataset].concat(assetDatasets);
		for (let d of datasets) {
			console.log(d.label);
		}
		return datasets;
	}

	function makeChart(ctx: HTMLCanvasElement, forecast: Forecast) {
		const chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: buildLabels(forecast),
				datasets: buildDatasets(forecast)
			},
			options: {
				elements: {
					point: {
						pointStyle: false
					}
				},
				plugins: {
					legend: {
						display: true
					}
				},
				interaction: {
					mode: 'index',
					intersect: false
				}
			},
			plugins: [
				{
					id: 'verticalLine',
					afterInit: (chart, args, opts) => {
						chart.verticalLine = {};
					},
					afterEvent: (chart, args, options) => {
						const { inChartArea } = args;
						chart.verticalLine = { draw: inChartArea };
					},
					afterDraw: (chart) => {
						const { draw } = chart.verticalLine;
						if (!draw) {
							return;
						}
						if (chart.tooltip?.caretX) {
							let x = chart.tooltip.caretX;
							let yAxis = chart.scales.y;
							let ctx = chart.ctx;
							ctx.save();
							ctx.beginPath();
							ctx.moveTo(x, yAxis.top);
							ctx.lineTo(x, yAxis.bottom);
							ctx.lineWidth = 1;
							ctx.strokeStyle = 'rgba(0, 0, 255, 0.4)';
							ctx.stroke();
							ctx.restore();
						}
					}
				}
			]
		});
		return {
			update(forecast: Forecast) {
				chart.data.labels = buildLabels(forecast);
				chart.data.datasets = buildDatasets(forecast);
				chart.update();
			},
			destroy() {
				chart.destroy();
			}
		};
	}
</script>

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
