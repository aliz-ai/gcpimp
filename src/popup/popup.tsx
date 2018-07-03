import React from 'react';
import * as ReactDOM from 'react-dom';
import { configService } from '../common/config.service';
import { getProjectId } from '../common/utils';

const getSelectedTab = () => new Promise<chrome.tabs.Tab>(resolve => chrome.tabs.getSelected(resolve));

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

	public render() {

		return (
			<div className='app-root'>
				<h1>GCP Enhancer</h1>
				{this.state.projectId &&
					<div>
					<div>Custom toolbar color for {this.state.projectId}</div>
					<input type='color' value={this.state.toolbarColor} onChange={e => this.onColorChange(e)}/>
					</div>
				}
			</div>
		);
	}
}

ReactDOM.render(<Popup />, document.getElementById('root'));
