import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/readme',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            children:[
                {
                    path: '/',
                    component: resolve => require(['../components/page/Readme.vue'], resolve)
                },

                {
                    path: '/basetable',
                    component: resolve => require(['../components/page/BaseTable.vue'], resolve)
                },
                /////系统管理
                {
                    path: '/system/setup',
                    name: 'SystemSetup',
                    component: resolve => require(['../components/page/SystemSetup.vue'], resolve)     // vue-datasource组件
                },
                {
                    path: '/select/strategy',
                    component: resolve => require(['../components/page/SelectStrategy.vue'], resolve)     // vue-datasource组件
                },
                {
                    path: '/strategy/manage',
                    component: resolve => require(['../components/page/StrategyManage.vue'], resolve)     // vue-datasource组件
                },
                {
                    path: '/riskctrl/manage',
                    component: resolve => require(['../components/page/RiskctrlManage.vue'], resolve)     // vue-datasource组件
                },
                {
                    path: '/order/gateway',
                    component: resolve => require(['../components/page/OrderGatewayManage.vue'], resolve)     // vue-datasource组件
                },
                {
                    path: '/market/gateway',
                    component: resolve => require(['../components/page/MarketGatewayManage.vue'], resolve)     // vue-datasource组件
                },
                /////交易系统管理
                {
                    path: '/task/manage',
                    name: 'TradeTaskManage',
                    component: resolve => require(['../components/page/TradeTaskManage.vue'], resolve)     // vue-datasource组件
                },
                {
                    path: '/task/log',
                    component: resolve => require(['../components/page/TradeTaskLog.vue'], resolve)     // vue-datasource组件
                },
                {
                    path: '/task/buysell',
                    component: resolve => require(['../components/page/TradeTaskBuySellPoint.vue'], resolve)     // vue-datasource组件
                },
                {
                    path: '/task/detail',
                    name: 'TradeTaskDetail',
                    component: resolve => require(['../components/page/TradeTaskDetail.vue'], resolve)     // vue-datasource组件
                },
                /////监测系统管理
                /*
                {
                    path: '/monitor/manage',
                    name: 'MonitorTaskManage',
                    component: resolve => require(['../components/page/MonitorTaskManage.vue'], resolve)     // vue-datasource组件
                },
                {
                    path: '/monitor/buysell',
                    name: 'MonitorBuySell',
                    component: resolve => require(['../components/page/MonitorBuySellPoint.vue'], resolve)     // vue-datasource组件
                },
                */
                /////选股系统管理
                {
                    path: '/select/manage',
                    name: 'PickstockTaskManage',
                    component: resolve => require(['../components/page/SelectTaskManage.vue'], resolve)     // vue-datasource组件
                },
                /*
                {
                    path: '/start/select',
                    component: resolve => require(['../components/page/StartSelect.vue'], resolve)     // vue-datasource组件
                },*/
                {
                    path: '/select/result',
                    name: 'PickstockResult',
                    component: resolve => require(['../components/page/SelectResult.vue'], resolve)     // vue-datasource组件
                },
                /////回测系统管理
                {
                    path: '/backtest/manage',
                    name: 'BacktestTaskManage',
                    component: resolve => require(['../components/page/BacktestTaskManage.vue'], resolve)     // vue-datasource组件
                },
                /*
                {
                    path: '/start/backtest',
                    name: 'StartBacktest',
                    component: resolve => require(['../components/page/StartBacktest.vue'], resolve)     // vue-datasource组件
                },*/
                {
                    path: '/backtest/result',
                    name: 'BacktestResult',
                    component: resolve => require(['../components/page/BacktestResult.vue'], resolve)     // vue-datasource组件
                },
                /////历史数据管理
                {
                    path: '/data/manage',
                    component: resolve => require(['../components/page/DataManage.vue'], resolve)     // vue-datasource组件
                },
                {
                    path: '/history/data',
                    component: resolve => require(['../components/page/HistoryData.vue'], resolve)     // vue-datasource组件
                },
            ]
        },
        {
            path: '/login',
            component: resolve => require(['../components/page/Login.vue'], resolve)
        },
        {
            path: '/register',
                component: resolve => require(['../components/page/Register.vue'], resolve)
        },
    ]
})
