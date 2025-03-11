import { useState, useEffect } from 'react';
import HOOK_LM_POP from '@/store/hooks/hookPop';

const LmPop = () => {
	const { getLmPop, setLmPop } = HOOK_LM_POP();
	const [showClass, setShowClass] = useState(false);

	useEffect(() => {
		setLmPop(getLmPop.reset)
	}, []);

	useEffect(() => {
		if (getLmPop.show) {
			setShowClass('show');
		}
	}, [getLmPop]);

	const hidePop = () => {
		setShowClass('');
		setTimeout(() => {
			setLmPop(getLmPop.reset)
		}, 300);
	}

	const funCancel = () => {
		if(getLmPop.cancel_fun){
			getLmPop.cancel_fun(hidePop);
		} else {
			hidePop();
		}
	}

	const funSuccess = () => {
		if(getLmPop.success_fun){
			getLmPop.success_fun(hidePop);
		} else {
			hidePop();
		}
	}

	return (
		getLmPop.show && 
		<div className="lm-pop">
			<div className={`lm-pop-inner ${showClass}`} onClick={ () => { hidePop() } }>
				<div className="lm-pop-container" onClick={ (e) => { e.stopPropagation() } }>
					{getLmPop.title && (
						<div className="lm-pop-title" dangerouslySetInnerHTML={{ __html: getLmPop.title }} />
					)}
					{getLmPop.contents && (
						typeof getLmPop.contents === 'object' ?
							<div className="lm-pop-contents">{ getLmPop.contents}</div>
							: <div className="lm-pop-contents" dangerouslySetInnerHTML={{ __html: getLmPop.contents }} />
						
					)}
					<div className={`lm-pop-bt-wrap ${ !getLmPop.title && !getLmPop.contents ? 'no-data' : '' }`}>

						{getLmPop.type === 'confirm' && (
						<button className="lm-pop-bt-cancle" onClick={ ()=> { funCancel() } } dangerouslySetInnerHTML={{ __html: getLmPop.cancle_title }} />
						)}
						<button className="lm-pop-bt-success" onClick={ ()=> { funSuccess() } } dangerouslySetInnerHTML={{ __html: getLmPop.success_title }} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default LmPop;
