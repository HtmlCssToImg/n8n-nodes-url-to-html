import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class UrlToHtml implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'URL To HTML',
		name: 'urlToHtml',
		icon: { light: 'file:urltohtmllight.svg', dark: 'file:urltohtmldark.svg' },
        group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["url"]}}',
		description: 'Extract HTML content from URLs/websites',
		defaults: {
			name: 'URL To HTML',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'urlToHtmlApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://pdfmunk.com/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				placeholder: 'https://example.com',
				description: 'The URL to extract HTML from',
				required: true,
			},
			{
				displayName: 'Wait Till',
				name: 'wait_till',
				type: 'options',
				options: [
					{
						name: 'Load',
						value: 'load',
					},
					{
						name: 'DOM Content Loaded',
						value: 'domcontentloaded',
					},
					{
						name: 'Network Idle',
						value: 'networkidle0',
					},
				],
				default: 'load',
				description: 'When to consider the page loaded',
			},
			{
				displayName: 'Timeout(ms)',
				name: 'timeout',
				type: 'number',
				default: 30000,
				description: 'Maximum time to wait for page load in milliseconds',
			},
			{
				displayName: 'Viewport Width',
				name: 'viewport_width',
				type: 'number',
				default: 1280,
				description: 'Width of the browser viewport in pixels',
			},
			{
				displayName: 'Viewport Height',
				name: 'viewport_height',
				type: 'number',
				default: 720,
				description: 'Height of the browser viewport in pixels',
			},
			{
				displayName: 'Wait For Timeout(ms)',
				name: 'wait_for_timeout',
				type: 'number',
				default: 2000,
				description: 'Additional time to wait after page load in milliseconds',
			},
			{
				displayName: 'User Agent',
				name: 'user_agent',
				type: 'string',
				default: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				description: 'User agent string to use for the request',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const url = this.getNodeParameter('url', i) as string;
				const wait_till = this.getNodeParameter('wait_till', i) as string;
				const timeout = this.getNodeParameter('timeout', i) as number;
				const viewport_width = this.getNodeParameter('viewport_width', i) as number;
				const viewport_height = this.getNodeParameter('viewport_height', i) as number;
				const wait_for_timeout = this.getNodeParameter('wait_for_timeout', i) as number;
				const user_agent = this.getNodeParameter('user_agent', i) as string;

				const body = {
					url,
					wait_till,
					timeout,
					viewport_width,
					viewport_height,
					wait_for_timeout,
					user_agent,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'urlToHtmlApi',
					{
						method: 'POST',
						url: 'https://pdfmunk.com/api/v1/url-to-html',
						body,
						json: true,
					},
				);

				returnData.push({
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error);
			}
		}

		return [returnData];
	}
}
