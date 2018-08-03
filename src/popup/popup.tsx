import React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-md/lib/Buttons';
import { Paper } from 'react-md/lib/Papers';
import { Toolbar } from 'react-md/lib/Toolbars';
import { configService } from '../common/config.service';
import { getProjectId } from '../common/utils';

const getSelectedTab = () =>
	new Promise<chrome.tabs.Tab>(resolve => chrome.tabs.getSelected(resolve));

interface PopupState {
	toolbarColor: string | undefined;
	projectId: string | undefined;
}

class Popup extends React.Component<{}, PopupState> {
	public state = {
		toolbarColor: undefined,
		projectId: undefined,
	};

	public async componentDidMount() {
		const currentTab = await getSelectedTab();
		const projectId = getProjectId(currentTab.url);
		const toolbarColor = await configService.getCustomToolbarColor(projectId);
		this.setState({ projectId, toolbarColor });
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
					</div>
				)}
			</div>
		);
	}
}

ReactDOM.render(<Popup />, document.getElementById('root'));
