package site.daska.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // AndroidManifest.xml sets this activity's theme to
        // AppTheme.NoActionBarLaunch (Theme.SplashScreen), which is only
        // meant for the brief launch moment and doesn't reliably apply
        // attributes like windowLightStatusBar for the app's ongoing
        // running state. Switch to the real running theme here, right
        // after the splash phase hands off, as Android's own splash
        // screen migration guide recommends.
        setTheme(R.style.AppTheme_NoActionBar);
        super.onCreate(savedInstanceState);
    }
}