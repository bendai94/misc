import java.awt.*;
import javax.swing.*;
import java.awt.event.*;
import java.awt.image.*;
import java.applet.*;

public class Main extends JApplet implements Runnable, KeyListener
{
	Thread redate;
	Image image, BG;
	Field one, two;
	long score1 = 0, score2 = 0;

	Graphics offscreen;
	ImageLoader[] IL = new ImageLoader[3];
	static final int REFRESH_RATE = 40;

	public void init()
	{
		setBackground(Color.white);	

		one = new Field(this, 200, 100);
		two = new Field(this, 200, 600);
		one.start();
		two.start();
		redate = new Thread(this);
		if (redate!=null)
			redate.start();

		image = createImage(1000, 500);
		offscreen = image.getGraphics();

		IL[0] = new ImageLoader(this, "bg.gif", true);
		BG = IL[0].getImage();

		addKeyListener(this);
	}
	public void start()
	{
	}
	public void update(Graphics g)
	{
		paint(g);
	}
	public void paint(Graphics g)
	{
		offscreen.drawImage(BG,0,0,500,500,this);
		offscreen.drawImage(BG,495,0,500,500,this);
		//System.out.println("<<Main Painting>>");
		one.paint(offscreen);
		two.paint(offscreen);

		g.drawImage(image, 0, 0, this);
	}
	public void run()
	{
		while (Thread.currentThread()==redate)
		{
			//System.out.println("<<Main Running>>");
			try
			{
				Thread.sleep (REFRESH_RATE);
			} catch (Exception e) {};
			long temp1, temp2;
			temp1=one.getScore();
			temp2=two.getScore();
			if ((temp1 != score1) || (temp2 != score2))
			{
				score1=temp1;
				score2=temp2;
				System.out.println("Player1\tPlayer2");
				System.out.println(score1+"\t"+score2);
			}
			repaint();
		}
	}
	public void stop()
	{
	}
	public void keyPressed(KeyEvent e)
	{
		switch(e.getKeyCode())
		{
			case 16:
				if (e.getKeyLocation()==KeyEvent.KEY_LOCATION_LEFT)
					one.Pressed(4);
				break;
			case 65:
				one.Pressed(0);
				break;
			case 87:
				one.Pressed(1);
				break;
			case 68:
				one.Pressed(2);
				break;
			case 83:
				one.Pressed(3);
				break;
			
			case 17:
				if (e.getKeyLocation()==KeyEvent.KEY_LOCATION_RIGHT)
					two.Pressed(4);
				break;
			case 37:
			case 38:
			case 39:
			case 40:
				two.Pressed(e.getKeyCode()-37);
				break;
			case 67:
				one.clearScore();
				two.clearScore();
				break;
			default:
				System.out.println(""+e.getKeyCode());
				break;
		}
	}
	public void keyTyped(KeyEvent e)
	{
	}
	public void keyReleased(KeyEvent e)
	{
		switch(e.getKeyCode())
		{
			case 16:
				one.Released(4);
				break;
			case 17:
				two.Released(4);
				break;
		}
	}
}
