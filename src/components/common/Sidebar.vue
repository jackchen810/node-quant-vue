<template>
    <div class="sidebar">
        <el-menu :default-active="onRoutes" class="el-menu-vertical-demo" theme="dark" unique-opened router>
            <template v-for="item in items">
                <template v-if="item.subs">
                    <el-submenu :index="item.index">
                        <template slot="title"><i :class="item.icon"></i>{{ item.title }}</template>
                        <el-menu-item v-for="(subItem,i) in item.subs" :key="i" :index="subItem.index">{{ subItem.title }}
                        </el-menu-item>
                    </el-submenu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.index">
                        <i :class="item.icon"></i>{{ item.title }}
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script>
    //import global_ from 'components/common/Global';
    export default {
        data: function() {
            return {
                user_type:1,  //0:管理员, 1:用户
                items: [
                    {
                        icon: 'el-icon-menu',
                        index: '1',
                        title: '用户管理',
                        subs: [
                            {
                                index: '/basetable',
                                title: '用户列表'
                            },
                        ]
                    },
		            {
                        icon: 'el-icon-date',
                        index: '2',
                        title: '系统管理',
                        subs: [
                            {
                                index: '/system/setup',
                                title: '系统设置'
                            },
                            {
                                index: '/select/strategy',
                                title: '选股策略列表'
                            },
                            {
                                index: '/strategy/manage',
                                title: '交易策略列表'
                            },
                            {
                                index: '/riskctrl/manage',
                                title: '风控列表'
                            },
                            {
                                index: '/order/gateway',
                                title: '交易接口列表'
                            },
                            {
                                index: '/market/gateway',
                                title: '行情接口列表'
                            }
                        ]
                    },
                    /*
                    {
                        icon: 'el-icon-menu',
                        index: '3',
                        title: '监测任务管理',
                        subs: [
                            {
                                index: '/monitor/manage',
                                title: '任务列表'
                            },
                            {
                                index: '/monitor/buysell',
                                title: '买卖点统计'
                            },
                        ]
                    },*/
                    {
                        icon: 'el-icon-service',
                        index: '4',
                        title: '交易任务管理',
                        subs: [
                            {
                                index: '/task/manage',
                                title: '任务列表'
                            },
                            {
                                index: '/task/log',
                                title: '任务日志'
                            },
                            {
                                index: '/task/buysell',
                                title: '买卖点统计'
                            },
                        ]
                    },
                    {
                        icon: 'el-icon-document',
                        index: '5',
                        title: '选股系统管理',
                        subs: [
                            {
                                index: '/select/manage',
                                title: '任务列表'
                            },
                            {
                                index: '/select/result',
                                title: '选股结果'
                            }
                        ]
                    },
                    {
                        icon: 'el-icon-refresh',
                        index: '6',
                        title: '回测系统管理',
                        subs: [
                            {
                                index: '/backtest/manage',
                                title: '任务列表'
                            },
                            /*
                            {
                                index: '/start/backtest',
                                title: '发起回测'
                            },*/
                            {
                                index: '/backtest/result',
                                title: '回测结果'
                            }
                        ]
                    },
                    {
                        icon: 'el-icon-edit',
                        index: '7',
                        title: '历史数据管理',
                        subs: [
                            {
                                index: '/data/manage',
                                title: '计划列表'
                            },
                            {
                                index: '/history/data',
                                title: '历史数据'
                            },
                        ]
                    },
                ]
            }
        },
        created: function(){
            this.user_type = localStorage.getItem('user_type');  //管理员或用户

            if (this.user_type == 0){
                return;
            }

            //如果是普通用户，去掉系统管理的操作
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].index == '2') {
                    this.items.splice(i, 1);
                }
            }
        },
        computed:{
            onRoutes(){
                return this.$route.path.replace('/','');
            }
        },
        methods:{
            getUser: function(){
                var self = this;
            },
        },
        mounted: function(){
            //this.data();
        },
    }
</script>

<style scoped>
    .sidebar{
        display: block;
        position: absolute;
        width: 250px;
        left: 0;
        top: 70px;
        bottom:0;
        background: #2E363F;
    }
    .sidebar > ul {
        height:100%;
    }
</style>
