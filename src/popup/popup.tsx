import React from 'react';
import * as ReactDOM from 'react-dom';
import { Autocomplete } from 'react-md/lib/Autocompletes';
import { Button } from 'react-md/lib/Buttons';
import { Divider } from 'react-md/lib/Dividers';
import { FontIcon } from 'react-md/lib/FontIcons';
import { Paper } from 'react-md/lib/Papers';
import { SelectField } from 'react-md/lib/SelectFields';
import { Toolbar } from 'react-md/lib/Toolbars';
import { configService } from '../common/config.service';
import { CURRENCY_CODES, CurrencyCode } from '../common/currency-codes';
import { getProjectId } from '../common/utils';

const getSelectedTab = () =>
	new Promise<chrome.tabs.Tab>(resolve => chrome.tabs.getSelected(resolve));

interface PopupState {
	toolbarColor: string | undefined;
	projectId: string | undefined;
	currencyCode: CurrencyCode | undefined;
}

class Popup extends React.Component<{}, PopupState> {
	public state = {
		toolbarColor: undefined,
		projectId: undefined,
		currencyCode: undefined,
	};

	private currencyMenuItems = CURRENCY_CODES.map(code => ({ label: code, value: code }));

	public async componentDidMount() {
		const currentTab = await getSelectedTab();
		const projectId = getProjectId(currentTab.url);
		const toolbarColor = await configService.getCustomToolbarColor(projectId);
		const currencyCode = await configService.getCurrencyCode();
		this.setState({ projectId, toolbarColor, currencyCode });
	}

	private onColorChange(event: React.ChangeEvent<HTMLInputElement>) {
		const newColor = event.target.value;
		this.setState({ toolbarColor: newColor });
		configService.setCustomToolbarColor(this.state.projectId, newColor);
	}

	private setColor(newColor: string) {
		this.setState({ toolbarColor: newColor });
		configService.setCustomToolbarColor(this.state.projectId, newColor);
	}

	private resetColor() {
		this.setState({ toolbarColor: undefined });
		configService.setCustomToolbarColor(this.state.projectId, undefined);
	}

	private setCurrencyCode(currencyCode: CurrencyCode) {
		this.setState({ currencyCode });
		configService.setCurrencyCode(currencyCode);
	}

	private sampleColor(color: string, label: string) {
		return (
			<Paper
				zDepth={1}
				raiseOnHover
				className='sample-color'
				style={{ backgroundColor: color }}
				onClick={() => this.setColor(color)}
			>
				{label}
			</Paper>
		);
	}

	public render() {
		return (
			<div className='app-root'>
				<Toolbar colored title='GCP Enhancer' />
				{this.state.projectId && (
					<div className='popup-content'>
						<div className='md-title'>{this.state.projectId}</div>
						<div className='md-caption'>Custom toolbar color</div>
						<div className='color-row'>
							{this.sampleColor('#2b4162', 'Dev')}
							{this.sampleColor('#ec9a29', 'Staging')}
							{this.sampleColor('#931621', 'Prod')}
							<input
								type='color'
								className='custom-color'
								value={this.state.toolbarColor}
								onChange={e => this.onColorChange(e)}
							/>
							<Button
								floating
								secondary
								mini
								tooltipLabel='Reset'
								className='reset'
								onClick={() => this.resetColor()}
							>
								format_color_reset
							</Button>
						</div>
						<Divider style={{ marginTop: '8px', marginBottom: '8px' }} />
						<div className='currency-row'>
							<div className='md-caption'>Currency preference: {this.state.currencyCode || 'USD'}</div>
							<Autocomplete
								id='currency-select'
								label='Currency preference'
								data={[...CURRENCY_CODES]}
								fullWidth
								onChange={code => this.setCurrencyCode(code as CurrencyCode)}
								filter={Autocomplete.caseInsensitiveFilter}
							/>
							<SelectField
								id='currency-selector'
								label='Currency preference'
								menuItems={[...CURRENCY_CODES]}
								position={SelectField.Positions.TOP_LEFT}
								dropdownIcon={<FontIcon>attach_money</FontIcon>}
							/>
						</div>
					</div>
				)}
			</div>
		);
	}
}

ReactDOM.render(<Popup />, document.getElementById('root'));
