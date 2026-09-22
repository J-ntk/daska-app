package site.daska.app;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Paint the window navy from the very first possible moment — a
        // plain solid color, no dependency on theme/drawable resource
        // resolution timing, so there's never a frame where Android's own
        // default black shows before any of our own styling applies.
        getWindow().setBackgroundDrawable(new ColorDrawable(Color.parseColor("#0A0E1A")));

        WebView.setWebContentsDebuggingEnabled(true);

        // AndroidManifest.xml sets this activity's theme to
        // AppTheme.NoActionBarLaunch (Theme.SplashScreen), which is only
        // meant for the brief launch moment and doesn't reliably apply
        // attributes like windowLightStatusBar for the app's ongoing
        // running state. Switch to the real running theme here, right
        // after the splash phase hands off.
        setTheme(R.style.AppTheme_NoActionBar);
        super.onCreate(savedInstanceState);

        // The WebView loads https://daska.site over the network — that
        // fetch takes real time, and until it finishes the WebView's own
        // canvas otherwise shows its platform default (black) instead of
        // the app's brand color. Painting it navy up front means that
        // loading gap now looks intentional instead of broken.
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.setBackgroundColor(Color.parseColor("#0A0E1A"));
        }
    }
}