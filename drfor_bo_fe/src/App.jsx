import { RecoilRoot } from 'recoil';
import { BrowserRouter } from 'react-router-dom';
import MyRouter from '@/router';

import LmCommon from '@/components/LmCommon';

function App() {
	return (
		<RecoilRoot>
			<BrowserRouter>
				<LmCommon />
				<MyRouter />
			</BrowserRouter>
		</RecoilRoot>
	);
}

export default App;
