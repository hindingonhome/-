using System;
using System.IO;
using System.Drawing;
using System.Diagnostics;
using System.Windows.Forms;
using System.Threading;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

internal sealed class LiteWindow : Form {
    readonly WebView2 view = new WebView2();
    const string Home = "https://metallab-lite.local/index.html";
    readonly string testFolder = Environment.GetEnvironmentVariable("METALLAB_SLIM_TEST");
    public LiteWindow() {
        Text="MetalLab Lite · Slim Preview"; Width=1200; Height=820; MinimumSize=new Size(640,560);
        BackColor=Color.White; StartPosition=FormStartPosition.CenterScreen;
        Icon=new Icon(Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"Lite.ico"));
        view.Dock=DockStyle.Fill; Controls.Add(view);
        if(!String.IsNullOrEmpty(testFolder)){Opacity=0;ShowInTaskbar=false;}
    }
    protected override async void OnShown(EventArgs e) {
        base.OnShown(e);
        try {
            CoreWebView2Environment.GetAvailableBrowserVersionString();
            var profile=String.IsNullOrEmpty(testFolder)?Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"MetalLab Lite Slim"):Path.GetFullPath(testFolder);
            Directory.CreateDirectory(profile);
            var options=new CoreWebView2EnvironmentOptions();
            if(!String.IsNullOrEmpty(testFolder))options.AdditionalBrowserArguments="--remote-debugging-port=9227";
            var env=await CoreWebView2Environment.CreateAsync(null,profile,options);
            await view.EnsureCoreWebView2Async(env);
            view.CoreWebView2.SetVirtualHostNameToFolderMapping("metallab-lite.local",Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"web"),CoreWebView2HostResourceAccessKind.DenyCors);
            view.CoreWebView2.Settings.AreBrowserAcceleratorKeysEnabled=false;
            view.CoreWebView2.Settings.IsStatusBarEnabled=false;
            view.CoreWebView2.Settings.AreDevToolsEnabled=!String.IsNullOrEmpty(testFolder);
            view.CoreWebView2.NavigationStarting+=(sender,args)=>{if(!args.Uri.StartsWith("https://metallab-lite.local/",StringComparison.OrdinalIgnoreCase)&&!args.Uri.StartsWith("blob:https://metallab-lite.local/",StringComparison.OrdinalIgnoreCase))args.Cancel=true;};
            view.CoreWebView2.NewWindowRequested+=(sender,args)=>{args.Handled=true;Uri uri;if(Uri.TryCreate(args.Uri,UriKind.Absolute,out uri)&&uri.Scheme=="https")Process.Start(new ProcessStartInfo(uri.AbsoluteUri){UseShellExecute=true});};
            view.CoreWebView2.DownloadStarting+=(sender,args)=>{
                if(!String.IsNullOrEmpty(testFolder)){args.ResultFilePath=Path.Combine(profile,Path.GetFileName(args.ResultFilePath));args.Handled=true;return;}
                using(var dialog=new SaveFileDialog()) {
                    dialog.Title="保存 MetalLab Lite 文件";dialog.FileName=Path.GetFileName(args.ResultFilePath);dialog.OverwritePrompt=true;
                    if(dialog.ShowDialog(this)!=DialogResult.OK){args.Cancel=true;return;}
                    args.ResultFilePath=dialog.FileName;args.Handled=true;
                }
            };
            view.CoreWebView2.Navigate(Home);
        } catch(WebView2RuntimeNotFoundException) {
            if(MessageBox.Show("需要 Microsoft Edge WebView2 Runtime。是否打开微软官方下载页面？\n本应用不会静默下载或安装运行环境。","缺少运行环境",MessageBoxButtons.YesNo,MessageBoxIcon.Information)==DialogResult.Yes)
                Process.Start(new ProcessStartInfo("https://developer.microsoft.com/microsoft-edge/webview2/"){UseShellExecute=true});
            Close();
        } catch(Exception error) {MessageBox.Show(error.Message,"MetalLab Lite 启动失败",MessageBoxButtons.OK,MessageBoxIcon.Error);Close();}
    }
    [STAThread] static void Main(){
        bool first;var testing=!String.IsNullOrEmpty(Environment.GetEnvironmentVariable("METALLAB_SLIM_TEST"));
        using(var mutex=new Mutex(true,testing?"Local\\MetalLabLiteSlim.Test":"Local\\MetalLabLiteSlim",out first)){
            if(!first){if(!testing)MessageBox.Show("MetalLab Lite Slim 已经运行，请切换到已打开的窗口。","MetalLab Lite Slim");return;}
            try{Application.EnableVisualStyles();Application.SetCompatibleTextRenderingDefault(false);Application.Run(new LiteWindow());}finally{mutex.ReleaseMutex();}
        }
    }
}
