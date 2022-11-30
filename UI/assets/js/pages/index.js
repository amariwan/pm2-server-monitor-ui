const { createApp } = Vue;
const app = createApp({
	data() {
		return {
			interval: 1000, // Interval time for server to transmit data
			servers: servers, //server information list
			currentProject: Object.keys(servers)[0], // Setting the default value of `currentProject` to the first key of the `servers` object.
			socketQueue: [], // An empty array that will be used to store the socket connections.
			year: new Date().getFullYear(), // Setting the `year` property to the current year.
			hostname: '',
			cpuUsage: '',
			cpus: '',
			cpuUsageCls: '',
			memUsage: '',
			memUsageCls: '',
			freemem: '',
			totalmem: '',
			nodev: '',
			godid: '',
			platform: '',
			projectName: '',
			instances: '',
			cpu: '',
			cpuCls: '',
			memory: '',
			restart: '',
			totalUptime: '',
			UserId: '',
			UserRole: '',
			userName: '',
			UserFirstName: 'tess',
			UserLastName: 'tes'
		};
	},
	mounted() {
		// Determine the server to display according to the url parameter
		const url = new URL(window.location.href);
		const server = url.searchParams.get('server');
		if (server) {
			this.currentProject = server;
		}

		// load ws for the first time
		this.resetSocket();
	},
	computed: {
		// Get the server's ip and port
		getIps: function() {
			return this.servers[this.currentProject];
		}
	},
	methods: {
		checkLogger() {
			axios
				.get('https://localhost:4003/auth/login', {
					withCredentials: true,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Content-Type': 'application/json'
					},
					withCredentials: true,
					method: 'GET'
				})
				.then((response) => {
					if (response.data.islogged) {
						var user = response.data.user;
						this.UserId = user.UserId;
						this.UserRole = user.UserRole;
						this.UserName = user.UserName;
						this.UserFirstName = user.UserFirstName;
						this.UserLastName = user.UserLastName;
					} else {
						window.location.href = '/';
					}
				})
				.catch((error) => {
					console.error(error);
				});
		},
		logout() {
			axios
				.get('https://localhost:4003/auth/logout', {
					withCredentials: true,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Content-Type': 'application/json'
					},
					withCredentials: true,
					method: 'GET'
				})
				.then((response) => {
					window.location.href = '/';
				})
				.catch((error) => {
					console.error(error);
				});
		},
		//Get project information
		getProjects() {
			return Object.keys(this.servers);
		},

		getPathValue(object, path, defaultVal = '') {
			let ret = defaultVal;
			if (object === null || typeof object !== 'object' || typeof path !== 'string') {
				return ret;
			}
			path = path.split(/[\.\[\]]/).filter((n) => n != '');
			let index = -1;
			const len = path.length;
			let key;
			let result = true;
			while (++index < len) {
				key = path[index];
				if (!Object.prototype.hasOwnProperty.call(object, key) || object[key] == null) {
					result = false;
					break;
				}
				object = object[key];
			}
			if (result) {
				ret = object;
			}
			return ret;
		},

		// Reset the WebSocket connection
		resetSocket() {
			// After switching, close all previous websocket connections
			if (this.socketQueue.length > 0) {
				this.socketQueue.forEach((socket) => {
					socket.close();
				});
				this.socketQueue = [];
			}
			const ips = this.servers[this.currentProject];
			ips.forEach((item) => {
				var isHttps = item.https;
				var protocol = isHttps ? 'https' : 'http';
				const socket = io(
					`${protocol}://${item.host}:${item.port}?interval=${this.interval}`,
					{
						// transports: ['websocket']
					}
				);
				this.socketQueue.push(socket);

				const statsEl = document.getElementById(`host${item.host}:${item.port}`);

				// Global events are bound against socket
				socket.on('connect_failed', (e) => {
					console.log('Connection Failed');
				});
				socket.on('connect', (e) => {
					console.log('Connected');
				});
				socket.on('disconnect', (e) => {
					console.log('Disconnected');
				});
				socket.on('error', (e) => {
					console.log('error socket');
				});
				const onAction = (type, appName) => {
					socket.emit(type + 'App', appName);
				};
				const createActionItem = function(onclick, appName, type) {
					const actionBtn = document.createElement('input');
					actionBtn.value = type;
					actionBtn.type = 'button';
					actionBtn.className = 'btn_' + type;
					actionBtn.addEventListener('click', function handleClick(event) {
						onclick(type, appName);
					});
					return actionBtn;
				};

				socket.on('stats', (data) => {
					this.hostname = data.totalData.hostname;
					this.cpuUsage = data.totalData.cpuUsage + '%';
					this.cpus = data.totalData.cpus;
					this.cpuUsageCls = data.totalData.cpuCls ? 'red' : 'green';
					this.memUsage = data.totalData.memUsage;
					this.memUsageCls = data.totalData.memUsageCls ? 'red' : 'green';
					this.freemem = data.totalData.freemem;
					this.totalmem = data.totalData.totalmem;
					this.nodev = data.totalData.node_version;
					this.godid = data.totalData.godid;
					this.platform = data.totalData.platform;
					this.projectName = data.totalData.projectName;
					this.instances = data.totalData.instances;
					this.cpu = data.totalData.cpu;
					this.cpuCls = data.totalData.cpuCls;
					this.memory = data.totalData.memory;
					this.restart = data.totalData.restart;
					this.totalUptime = data.totalData.totalUptime;

					const processList = [];
					// stats-panel-list
					let html = '';
					if (data.processData && data.processData.length > 0) {
						data.processData.forEach((item, itemIndx) => {
							const cpuCls = this.getPathValue(item, 'cpuCls');

							// if(processList.indexOf(item.name) < 0)
							processList.push(item.name);
							html += `
                                <tr id="appIndx${itemIndx}">
                                <td><span>${item.pmid}</span></td>
                                <td><span>${item.name}</span></td>
                                <td><span>${item.mode}</span></td>
                                <td><span>${item.pid}</span></td>
                                <td class="status"><span class="${item.status}">${item.status}</span></td>
                                <td><span>${item.restart}</span></td>
                                <td><span>${item.uptime}</span></td>
                                <td ><span class="${cpuCls}">${item.cpu}</span></td>
                                <td><span>${item.memory}</span></td>
                                <td><span>${item.user}</span></td>
                                <td>
                                    <div class="remote_controll"></div>
                                </td>
                                </tr>
                            `;

							var trRow = document.createElement('tr');
							trRow.innerHTML = html;
							trRow.id = 'appIndx' + itemIndx;

							trRow.innerHTML = html;
							statsEl.querySelector('.stats-panel-list tbody').appendChild(trRow);
						});
					}
					statsEl.querySelector('.stats-panel-list tbody').innerHTML = html;
					processList.forEach((itemName, indx) => {
						statsEl
							.querySelector('.stats-panel-list tbody #appIndx' + indx + ' .remote_controll')
							.appendChild(createActionItem(onAction, itemName, 'start'));
						statsEl
							.querySelector('.stats-panel-list tbody #appIndx' + indx + ' .remote_controll')
							.appendChild(createActionItem(onAction, itemName, 'delete'));
						statsEl
							.querySelector('.stats-panel-list tbody #appIndx' + indx + ' .remote_controll')
							.appendChild(createActionItem(onAction, itemName, 'restart'));
						statsEl
							.querySelector('.stats-panel-list tbody #appIndx' + indx + ' .remote_controll')
							.appendChild(createActionItem(onAction, itemName, 'stop'));
					});
				});
			});
		}
	},
	watch: {
		currentProject: function() {
			const url = new URL(location.href);
			url.searchParams.set('server', this.currentProject);
			window.history.replaceState(null, '', url.href);
			this.$nextTick(() => {
				this.resetSocket();
			});
		}
	}
});

const vm = app.mount('.start');
vm.checkLogger();
