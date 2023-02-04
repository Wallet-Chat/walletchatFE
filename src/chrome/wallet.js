export default function WalletAccount(address) {
	let unreadCount = -1;
	let abortTimerId;
	let errorLives = 5;
	let isStopped = false;
	let requestTimer;
	let pollInterval = 10000; // every 10 seconds

	// Debug output (if enabled, might cause memory leaks)
	let verbose = false;

	this.onError = function () {};
	this.onUpdate = function () {};

	// Without this/that, no internal calls to onUpdate or onError can be made...
	let that = this;

	// Retrieves unread count
	this.getUnreadCount = function () {
		return Number(unreadCount);
	};

	// Handles a successful getInboxCount call and schedules a new one
	function handleSuccess(count) {
		logToConsole('success!');
		window.clearTimeout(abortTimerId);
		errorLives = 5;
		updateUnreadCount(count);
		//scheduleRequest();
	}

	// Handles a unsuccessful getInboxCount call and schedules a new one
	function handleError() {
		window.clearTimeout(abortTimerId);

		if (errorLives > 0) errorLives--;

		if (errorLives == 0) {
			errorLives = -1;
			setLoggedOutState();
		}

		//scheduleRequest();
	}

	async function getInboxCount() {
		if (address) {
			// console.log(`[getInboxCount][${address}`)

			fetch(
				` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/get_unread_cnt/${address}`,
				{
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('jwt')}`,
					},
				}
			)
				.then((response) => response.json())
				.then((count) => {
					console.log('✅ [GET][Unread Count] UNREAD COUNT:', count);
					handleSuccess(count);
				})
				.catch((error) => {
					console.error('🚨🚨[GET][Unread Count] Error:', error);
					handleError();
				});
		}
	}

	// Schedules a new getInboxCount call
	function scheduleRequest(interval) {
		if (isStopped) {
			return;
		}

		logToConsole('scheduling new request');

		if (interval != null) {
			window.setTimeout(getInboxCount, interval);
		} else {
			requestTimer = window.setTimeout(getInboxCount, pollInterval);
			window.setTimeout(scheduleRequest, pollInterval);
		}
	}

	// Updates unread count and calls onUpdate event
	function updateUnreadCount(count) {
		if (unreadCount != count) {
			unreadCount = count;
			logToConsole('unread count: ' + unreadCount);

			if (that.onUpdate != null) {
				try {
					logToConsole('trying to call onUpdate...');
					that.onUpdate(that);
				} catch (e) {
					console.error(e);
				}
			}
		}
	}

	// Calls onError and resets data
	function setLoggedOutState() {
		if (that.onError != null) {
			try {
				logToConsole('trying to call onError...');
				that.onError(that);
			} catch (e) {
				console.error(e);
			}
		}

		unreadCount = -1;
	}

	function logToConsole(text) {
		if (verbose) console.log(text);
	}

	// Starts the scheduler
	this.startScheduler = function () {
		logToConsole('starting scheduler...');
		getInboxCount();
		scheduleRequest();
	};

	// Stops the scheduler
	this.stopScheduler = function () {
		logToConsole('stopping scheduler...');
		isStopped = true;

		if (requestTimer != null) {
			window.clearTimeout(requestTimer);
		}

		that = null;
	};
}
