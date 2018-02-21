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
    import global_ from 'components/common/Global';
    export default {
        data() {
            return {
                items: [
                    {
                        icon: 'el-icon-menu',
                        index: '2',
                        title: '渠道管理',
                        subs: [
                            {
                                index: 'basetable',
                                title: '渠道列表'
                            },
                        ]
                    },
                    {
                        icon: 'el-icon-upload',
                        index: '3',
                        title: '批量执行任务',
                        subs: [
                            {
                                index: 'setpush',
                                title: '发起推送'
                            },
                            {
                                index: 'pushresult',
                                title: '推送结果'
                            }
                        ]
                    },
		            {
                        icon: 'el-icon-date',
                        index: '4',
                        title: '任务管理',
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
                            }
                        ]
                    },
                    {
                        icon: 'el-icon-document',
                        index: '5',
                        title: '策略管理',
                        subs: [
                            {
                                index: '/strategy/manage',
                                title: '策略列表'
                            }
                        ]
                    },
                    {
                        icon: 'el-icon-share',
                        index: '6',
                        title: '风险管理',
                        subs: [
                            {
                                index: '/riskctrl/manage',
                                title: '风控列表'
                            }
                        ]
                    }
                ]
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
            this.data();
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
