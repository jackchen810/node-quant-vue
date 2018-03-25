<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-star-on"></i>TASK管理</el-breadcrumb-item>
                <el-breadcrumb-item>TASK列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box rad-group">
            <el-button type="primary" icon="plus" class="handle-del mr10" @click="dialogFormVisible=true">创建回测任务</el-button>
        </div>
        <el-table :data="task_list" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column type="index" label="ID" width="60"></el-table-column>
            <!--
            <el-table-column prop="stock_name" label="股票名称" width="100"></el-table-column>
            <el-table-column prop="obj_amount" label="操作量" width="80"></el-table-column>
            -->
            <el-table-column prop="task_type" label="任务类型" width="100"></el-table-column>
            <el-table-column prop="trade_ktype" label="K线类型" width="100"></el-table-column>
            <el-table-column prop="strategy_name" label="策略标的" width="160"></el-table-column>
            <el-table-column prop="start_time" label="开始时间" width="160"></el-table-column>
            <el-table-column prop="end_time" label="结束时间" width="160"></el-table-column>
            <el-table-column prop="trade_symbol" label="交易标的" width="95"></el-table-column>
            <el-table-column prop="task_status" label="运行状态" width="95"></el-table-column>
            <el-table-column prop="price" label="最新价" width="80"></el-table-column>
            <el-table-column label="操作" width="120">
                <template slot-scope="scope">
                    <el-button class="btn1" type="text" size="small" @click="delTask(scope.row.task_id)">删除</el-button>
                    <el-button class="btn1" type="danger" size="small" v-if="scope.row.task_status =='running'" @click="stopTask(scope.row.task_id)">停止</el-button>
                    <el-button class="btn1" type="success" size="small" v-else @click="startTask(scope.row.task_id)">启动</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination">
            <el-pagination
                @current-change ="handleCurrentChange"
                :current-page="currentPage"
                layout="prev, pager, next"
                :total="pageTotal">
            </el-pagination>
        </div>
        <el-dialog title="添加交易任务" :visible.sync="dialogFormVisible" class="digcont" v-if="true" >
            <el-form :model="form" :rules="rules" ref="form">
                <el-form-item label="策略名称" prop="strategy_list" :label-width="formLabelWidth"
                              v-for="(item, index) in form.strategy_list"
                              :label="'策略' + index"
                              :key="item.key"
                              :prop="item.key">
                    <div class="block">
                        <label>股票代码：</label>
                        <el-input v-model="form.strategy_list[index].stock_symbol" class="inp150" auto-complete="off" placeholder="请输入股票代码" @change="changeStockSymbol(index)"></el-input>
                        <span v-text="form.strategy_list[index].stock_name"></span>
                    </div>
                    <div>
                        <label>K 线周期：</label>
                        <el-input v-model="form.strategy_main" v-if="index==0&&form.strategy_type>1" class="inp180" auto-complete="off" :disabled="true"></el-input>
                        <el-select v-model="form.strategy_list[index].stock_ktype" v-else class="inp180" placeholder="请选择K线周期">
                            <el-option label="1分钟" value="1"></el-option>
                            <el-option label="5分钟" value="5"></el-option>
                            <el-option label="15分钟" value="15"></el-option>
                            <el-option label="30分钟" value="30"></el-option>
                            <el-option label="60分钟" value="60"></el-option>
                            <el-option label="120分钟" value="120"></el-option>
                            <el-option label="日线" value="day"></el-option>
                            <el-option label="周线" value="week"></el-option>
                            <el-option label="月线" value="month"></el-option>
                        </el-select>
                    </div>
                    <div v-if="index==0">
                        <label>交易数量：</label>
                        <el-input v-model="form.strategy_list[index].trade_amount" class="inp180" auto-complete="off" placeholder="请输入交易数量"></el-input>
                    </div>
                    <div>
                        <label>对应策略：</label>
                        <el-select v-model="form.strategy_list[index].strategy_name" class="inp180" placeholder="请选择对应策略">
                            <el-option
                                v-for="item in strategy_file_list"
                                :key="item"
                                :label="item"
                                :value="item">
                            </el-option>
                        </el-select>
                        <el-button v-if="index==0&&form.strategy_type==1" :disabled="true">N</el-button>
                        <el-button v-else-if="index==0&&form.strategy_type>1" @click.prevent="addStrategyItem(index)">+</el-button>
                        <el-button v-else @click.prevent="removeStrategyItem(index)">-</el-button>
                    </div>
                </el-form-item>
                <el-form-item label="" prop="strategy_type" :inline="true":label-width="formLabelWidth">
                    <el-radio-group v-model="form.strategy_type" @change="changeStrategyItem(index)" :inline="true">
                        <el-radio label="1">简单策略</el-radio>
                        <el-radio label="2">多级别分析策略</el-radio>
                        <el-radio label="3">综合分析策略（策略0为主策略）</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="开始日期" prop="start_time" :label-width="formLabelWidth">
                    <el-date-picker
                        v-model="form.start_time"
                        align="right"
                        type="date"
                        placeholder="选择日期"
                        :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="结束日期" prop="end_time" :label-width="formLabelWidth">
                    <el-date-picker
                        v-model="form.end_time"
                        align="right"
                        type="date"
                        placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">退 出</el-button>
                <el-button type="primary" @click="saveAdd('form')"v-loading.fullscreen.lock="fullscreenLoading">添 加</el-button>
            </div>
        </el-dialog>
        <el-dialog title="添加交易任务" :visible.sync="dialogFormVisible" class="digcont" center="true" v-else >
            <span>请先绑定行情接口</span>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">退 出</el-button>
                <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import global_ from 'components/common/Global';
    export default {
        data: function(){
            return {

                pickerOptions: {
                    shortcuts: [{
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                },
                start_time: '',
                end_time: '',


                dialogFormVisible:false,
                dialogMarketVisible:false,
                dialogCheckVisible:false,
                radio3:'全部',

                tiemout:'',

                form: {
                    task_id:'',
                    task_status:'',
                    obj_amount:'',
                    trade_symbol:'111',
                    trade_ktype:'1',
                    stock_name:'www',
                    strategy_main:'主策略',
                    strategy_type:'1',
                    strategy_list:[{
                        stock_symbol:'',
                        stock_name:'',
                        stock_ktype:'',
                        trade_amount:'',
                        strategy_name:'',
                    }],
                    start_time: '',
                    end_time: '',
                    market_gateway: '',
                },
                rules: {
                    start_time:[
                        {required: true, message: '请输入开始时间', trigger: 'blur'},
                    ],
                    start_time:[
                        {required: true, message: '请输入开始时间', trigger: 'blur'},
                    ],
                    end_time:[
                        {required: true, message: '请输入结束时间', trigger: 'blur'}
                    ],
                },
                log:{
                    message:''
                },

                formLabelWidth: '100px',
                formLabelWidth50: '50px',
                fileList3: [],
                loading:false,
                fullscreenLoading: false,
                task_list:[],
                strategy_file_list:[],
                riskctrl_file_list:[],
                end_time_file_list:[],
                market_gateway_file_list:[],
                valid_stock_list:[],

                pageTotal:0,
                currentPage:1
            }
        },
        created: function(){
            if ( this.tiemout ) {
                clearTimeout(this.tiemout);
                this.tiemout = '';
            }

            this.getTaskList();
            //this.getTaskPrice();
            this.getStrategyList();

            //this.getValidStockList();
        },
        methods: {
            getTaskList: function(){//获取backtest task列表
                var self = this;
                self.loading = true;
                self.$axios.post('/api/backtest/list').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.pageTotal = res.data.extra.length;
                        self.task_list = res.data.extra.slice(0,10);
                    }
                    else{
                        self.task_list = [];
                    }
                })
            },
            getStrategyList: function(){//获取rom列表
                var self = this;
                self.loading = true;
                self.$axios.post('/api/strategy/list').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.strategy_file_list = res.data.extra;
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },
            saveAdd: function(formName){
                var self = this;

                var params = {
                    //trade_symbol:self.form.trade_symbol,
                    //stock_name:self.form.stock_name,
                    //obj_amount:self.form.obj_amount,
                    strategy_type:self.form.strategy_type,
                    strategy_list:self.form.strategy_list,
                    start_time:self.form.start_time,
                    end_time:self.form.end_time,
                };

                self.loading = true;
                self.$axios.post('/api/backtest/add', params).then(function(res){
                    self.loading = false;
                    console.log(res);
                    if(res.data.ret_code == 0){
                        self.$message('添加成功');
                        self.getTaskList();
                    }
                    else{
                        self.$message('添加失败:' + res.data.extra);
                    }

                },function(err){
                    self.$message('添加失败');
                    self.loading = false;
                    console.log(err);
                })

            },
            delTask: function(task_id){//删除
                var self = this;
                var params = {
                    task_id: task_id
                };
                self.loading = true;
                self.$axios.post('/api/backtest/del', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message('删除成功');
                        self.getTaskList();
                    }
                    else {
                        self.$message(res.data.extra);
                    }

                },function(err){
                    self.$message('删除失败');
                    self.loading = false;
                    console.log(err);
                })
            },
            startTask: function(task_id){//上架操作
                var self = this;
                var params = {
                    task_id: task_id,
                };
                self.loading = true;
                self.$axios.post('/api/backtest/start',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message('操作成功');
                        self.getTaskList();
                    }
                    else {
                        self.$message(res.data.extra);
                    }

                },function(err){
                    self.$message('操作失败');
                    self.loading = false;
                    console.log(err);
                })
            },
            stopTask: function(task_id){//下架操作
                var self = this;
                var params = {
                    task_id: task_id,
                };
                self.loading = true;
                self.$axios.post('/api/backtest/stop', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message('操作成功');
                        self.getTaskList();
                    }
                    else {
                        self.$message(res.data.extra);
                    }

                },function(err){
                    self.$message('操作失败');
                    self.loading = false;
                    console.log(err);
                })
            },
            handleCurrentChange:function(val){
                this.cur_page = val;
                this.getTaskList();
            },
            changeStockSymbol:function(index) {

                var stock_symbol = this.form.strategy_list[index].stock_symbol;

                //所有行的stock_symbol 一致
                if (this.form.strategy_type == 2) {
                    //var value = this.form.strategy_list[index].stock_symbol;
                    for(var i = 0; i<this.form.strategy_list.length; i++){
                        this.form.strategy_list[i].stock_symbol = stock_symbol;
                    }
                }


                //获取stock_symbol  对应的名称
                if (stock_symbol.length != 6){
                    this.form.strategy_list[index].stock_name = '';
                    return;
                }
                var self = this;
                var params = '';
                if (stock_symbol[0] == '6') {
                    params = '/sina/list=' + 'sh' + stock_symbol;
                }else{
                    params = '/sina/list=' + 'sz' + stock_symbol;
                }
                self.$axios.get(params).then(function(res){
                    var data_substr = res.data.match(/\"(\S*)(?=\")/);
                    if (data_substr == null) {
                        return;
                    }
                    var fields = data_substr[1].split(",");
                    self.form.strategy_list[index].stock_name = fields[0];

                },function(err){
                    self.form.strategy_list[index].stock_name = '';
                    console.log(err);
                })


            },
            changeStrategyItem: function(index) {
                //只保留一行
                var list0 = this.form.strategy_list[0];
                if (this.form.strategy_type == 1) {
                    this.form.strategy_list = [list0];
                }
            },
            removeStrategyItem(index) {
                this.form.strategy_list.splice(index, 1);
            },
            addStrategyItem(index) {
                var stock_symbol = '';
                if (this.form.strategy_type == 2) {
                    var stock_symbol = this.form.strategy_list[0].stock_symbol;
                }

                this.form.strategy_list.push({
                    stock_symbol:stock_symbol,
                    stock_ktype:'',
                    strategy_name:'',
                });

            }
        },
        computed:{

        }
    }
</script>

<style src="../../../static/css/datasource.css"></style>
<style>
    .rad-group{margin-bottom:20px;}
    .handle-input{  width: 300px;  display: inline-block;  }
    .handle-box2{display:inline-block;float:right;}
    /*.el-table_1_column_5{color:#eb9e05;}*/
    .orange{color:#eb9e05;background-color:none;}
    .btn2{margin-bottom:5px;margin-left:0;}
    .diainp{width:217px;}
    .diainp2{width:400px;}
    .inp80{width:80px;}
    .inp100{width:100px;}
    .inp120{width:120px;}
    .inp150{width:140px;}
    .inp160{width:160px;}
    .inp180{width:180px;}
    .nowrap{white-space:nowrap;}
    .upload-demo .el-upload {
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    .upload-demo .el-upload:hover {
        border-color: #409EFF;
    }
</style>
